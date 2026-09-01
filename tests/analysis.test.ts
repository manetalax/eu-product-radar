import test from 'node:test';
import assert from 'node:assert/strict';
import { parseProducts, validateProducts, analyze, MAX_FILE_BYTES, MAX_PRODUCTS, safeAuthDestination } from '../lib/analysis';
import { productQuota, quotaExceededMessage } from '../lib/quota';
import { readJsonBody, sameOrigin } from '../lib/http';

const bytes=(s:string)=>new TextEncoder().encode(s).buffer;

test('el informe entregado al usuario conserva exactamente cinco resultados esperados',()=>{
  const csv='nombre,fabricante,responsable,warning\nCargador USB,ElectroCo,EU Import SL,CE\nJuguete,Kids SA,,3+\nCamiseta,Textil SA,EU Rep,\nAuriculares,Audio GmbH,EU Rep,No lluvia\nBotella,Plastics Ltd,,Food safe';
  const products=parseProducts(bytes(csv),'catalogue.csv');
  assert.equal(products.length,5);
  const result=analyze(products);
  assert.equal(result.length,5);
  assert.deepEqual(result.map(p=>p.missing),[[],['Operador responsable UE'],['Seguridad/advertencias'],[],['Operador responsable UE']]);
});
test('acepta CSV separado por punto y coma, encabezados españoles y espacios', () => {
  const products=parseProducts(bytes('nombre ; fabricante ; responsable_ue ; advertencias\nLámpara ; Marca ; Operador UE ; No cubrir\n'),'datos.csv');
  assert.deepEqual(products,[{name:'Lámpara',manufacturer:'Marca',responsible:'Operador UE',warning:'No cubrir'}]);
});
test('acepta el encabezado global de operador sin romper responsable_ue', () => {
  const products=parseProducts(bytes('nombre,fabricante,responsable ue,warning\nLámpara,Marca,Operador UE,No cubrir\n'),'datos.csv');
  assert.equal(products[0]?.responsible,'Operador UE');
});
test('el motor está separado por mercado y Europa es el único módulo operativo', () => {
  const product={name:'Juguete',manufacturer:'Marca',responsible:'Operador UE',warning:'3+'};
  assert.equal(analyze([product],'EU').length,1);
  assert.throws(()=>analyze([product],'US' as never),/no activo/i);
});
test('la guía europea conserva fuentes oficiales y los próximos mercados tienen módulos aislados', async () => {
  const { MARKETS }=await import('../lib/markets');
  assert.equal(MARKETS.EU.status,'active');
  for(const code of ['US','CN','GB','CA'] as const) assert.equal(MARKETS[code].status,'planned');
});
test('importa XLS y XLSX sin perder los campos', async () => {
  const XLSX=await import('xlsx');
  const book=XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(book,XLSX.utils.json_to_sheet([{name:'A',manufacturer:'B',responsible:'C',warning:'D'}]),'Products');
  for(const type of ['xlsx','xls'] as const){
    const out=XLSX.write(book,{bookType:type,type:'array'}) as ArrayBuffer;
    const products=parseProducts(out,`catalogue.${type}`);
    assert.deepEqual(products,[{name:'A',manufacturer:'B',responsible:'C',warning:'D'}]);
  }
});
test('rechaza vacíos, formatos inválidos, nombres ausentes o encabezados ambiguos',()=>{
  assert.throws(()=>parseProducts(new ArrayBuffer(0),'empty.csv'),/vacío/);
  assert.throws(()=>parseProducts(bytes('x'),'test.txt'),/CSV, XLS o XLSX/);
  assert.throws(()=>parseProducts(bytes('nombre,fabricante,responsable,warning\n,Marca,EU,Aviso'),'test.csv'),/nombre/);
});
test('acepta exportaciones habituales de tiendas y marca como vacíos los campos que el canal no incluye', () => {
  const shopify = parseProducts(bytes('Handle,Title,Vendor,Variant SKU\nlampara,Lámpara LED,Marca Norte,LAMP-1\n'), 'shopify.csv');
  assert.deepEqual(shopify[0], { name: 'Lámpara LED', manufacturer: 'Marca Norte', responsible: '', warning: '' });
  assert.deepEqual(analyze(shopify)[0].missing, ['Operador responsable UE', 'Seguridad/advertencias']);
  const marketplace = parseProducts(bytes('item-name,brand,safety-warning\nAuriculares,Sonora,No usar bajo la lluvia\n'), 'marketplace.csv');
  assert.deepEqual(marketplace[0], { name: 'Auriculares', manufacturer: 'Sonora', responsible: '', warning: 'No usar bajo la lluvia' });
});
test('los límites rechazan archivos grandes y exceso de productos o campos', () => {
  assert.throws(()=>parseProducts(new ArrayBuffer(MAX_FILE_BYTES+1),'large.csv'), /5 MB/);
  const p={name:'A',manufacturer:'',responsible:'',warning:''};
  assert.throws(()=>validateProducts(Array(MAX_PRODUCTS+1).fill(p)), /límite/);
  assert.throws(()=>validateProducts([{...p,warning:'a'.repeat(1001)}]), /1000/);
  assert.throws(()=>validateProducts([{...p,manufacturer:4}]), /campo/);
  assert.throws(()=>parseProducts(bytes('name,manufacturer,responsible,warning\n'+Array(1001).fill('A,,,').join('\n')), 'large.csv'), /límite/);
});
test('el indicador solo evalúa presencia, no cumplimiento', () => {
  const products=validateProducts([{name:'Ejemplo',manufacturer:'No comprobado',responsible:'No comprobado',warning:'No comprobado'}]);
  assert.equal(analyze(products)[0].score,8);
});
test('la prueba gratuita cuenta cinco productos totales por cuenta y nunca se reinicia por fecha', () => {
  const august = productQuota(3, new Date('2026-08-29T23:30:00Z'));
  const september = productQuota(3, new Date('2026-09-29T23:30:00Z'));
  assert.deepEqual(august, { limit: 5, used: 3, remaining: 2, periodStart: 'lifetime', billing: { planId: 'free', planName: 'Gratis', status: null, productLimit: 5, currentPeriodEnd: null, cancelAtPeriodEnd: false, billingOption: null } });
  assert.deepEqual(september, august);
  assert.equal(productQuota(8).remaining, 0);
  assert.match(quotaExceededMessage(4, august), /5 productos en total.*contiene 4.*te quedan 2/i);
});
test('redirecciones de autenticación limitadas a destinos internos concretos', () => {
  for(const path of ['https://evil.example','//evil.example','/\\evil.example',null,'/dashboard?token=x']) assert.equal(safeAuthDestination(path),'/dashboard');
  assert.equal(safeAuthDestination('/reset-password'),'/reset-password');
});
test('las mutaciones requieren el origen configurado y JSON de tamaño acotado', async () => {
  const old=process.env.NEXT_PUBLIC_SITE_URL;
  process.env.NEXT_PUBLIC_SITE_URL='https://importverifier.netlify.app';
  try {
    assert.equal(sameOrigin(new Request('https://importverifier.netlify.app/api/analyses',{headers:{origin:'https://evil.example'}})),false);
    assert.equal(sameOrigin(new Request('https://importverifier.netlify.app/api/analyses',{headers:{origin:process.env.NEXT_PUBLIC_SITE_URL}})),true);
    assert.deepEqual(await readJsonBody(new Request('http://local',{method:'POST',body:'{"products":[]}'})),{products:[]});
    await assert.rejects(readJsonBody(new Request('http://local',{method:'POST',body:'x'})),/válido/);
  } finally {
    if(old===undefined) delete process.env.NEXT_PUBLIC_SITE_URL; else process.env.NEXT_PUBLIC_SITE_URL=old;
  }
});
