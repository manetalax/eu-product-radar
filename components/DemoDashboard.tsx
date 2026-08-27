'use client';
import { useState } from 'react';
import * as XLSX from 'xlsx';
import { copy, Lang } from '@/lib/i18n';

type Row=Record<string,string>;
type Result={name:string;score:number;priority:'ALTA'|'MEDIA'|'BAJA';missing:string[]};
const demoRows:Row[]=[
 {name:'Lámpara LED X',manufacturer:'',responsible:'',warning:''},
 {name:'Mochila Urban',manufacturer:'ACME',responsible:'',warning:''},
 {name:'Botella Sport',manufacturer:'ACME',responsible:'EU Rep SL',warning:'Sí'},
 {name:'Cargador USB',manufacturer:'',responsible:'',warning:'Sí'},
 {name:'Camiseta Basic',manufacturer:'Textiles SL',responsible:'Textiles SL',warning:'Info'}
];
function val(r:Row,names:string[]){const key=Object.keys(r).find(k=>names.some(n=>k.toLowerCase().includes(n)));return key?String(r[key]??'').trim():''}
function analyze(rows:Row[]):Result[]{return rows.map(r=>{const missing:string[]=[];if(!val(r,['manufacturer','fabricante']))missing.push('Fabricante');if(!val(r,['responsible','responsable']))missing.push('Responsable UE');if(!val(r,['warning','advertencia','safety','seguridad']))missing.push('Seguridad/advertencias');const score=Math.min(100,8+missing.length*28);return{name:val(r,['name','title','nombre','producto'])||'Producto',score,priority:score>=60?'ALTA':score>=30?'MEDIA':'BAJA',missing}})}
export default function Dashboard({lang,onHome}:{lang:Lang,onHome:()=>void}){
 const t=copy[lang]; const [results,setResults]=useState<Result[]>(analyze(demoRows)); const [tab,setTab]=useState('dashboard');
 async function load(file:File){const buf=await file.arrayBuffer();let rows:Row[]=[];if(/\.xlsx?$/i.test(file.name)){const wb=XLSX.read(buf);rows=XLSX.utils.sheet_to_json<Row>(wb.Sheets[wb.SheetNames[0]],{defval:''});}else{const text=new TextDecoder().decode(buf);const wb=XLSX.read(text,{type:'string'});rows=XLSX.utils.sheet_to_json<Row>(wb.Sheets[wb.SheetNames[0]],{defval:''});}setResults(analyze(rows));setTab('products');}
 const high=results.filter(x=>x.score>=60).length; const avg=results.length?Math.round(results.reduce((a,b)=>a+b.score,0)/results.length):0;
 function exportReport(){const data=results.map(r=>({Producto:r.name,'Risk Score':r.score,Prioridad:r.priority,Revisar:r.missing.join(', ')||'Sin faltantes básicos'}));const ws=XLSX.utils.json_to_sheet(data);const wb=XLSX.utils.book_new();XLSX.utils.book_append_sheet(wb,ws,'Informe');XLSX.writeFile(wb,'eu-product-radar-informe.xlsx');}
 return <main className="shell"><div className="toprow" style={{marginBottom:18}}><div className="brand">EU <b>Product Radar</b></div><button className="btn ghost" onClick={onHome}>Cerrar demo</button></div><div className="dashboard"><aside className="side"><h3>{t.dashboard}</h3>{[['dashboard',t.dashboard],['products',t.products],['history',t.history],['reports',t.reports],['settings',t.settings]].map(([id,label])=><button key={id} className={tab===id?'active':''} onClick={()=>setTab(id)}>{label}</button>)}</aside><section>
 {tab==='dashboard'&&<><div className="kpis"><div className="kpi"><span className="muted">Productos</span><strong>{results.length}</strong></div><div className="kpi"><span className="muted">Riesgo medio</span><strong>{avg}/100</strong></div><div className="kpi"><span className="muted">Prioridad alta</span><strong>{high}</strong></div><div className="kpi"><span className="muted">Plan</span><strong>Pro</strong></div></div><div className="card" style={{marginTop:16}}><h2>Nuevo análisis</h2><label className="drop" style={{display:'block',cursor:'pointer'}}><b>Selecciona CSV o Excel</b><br/><span className="muted">.csv, .xls, .xlsx</span><input style={{display:'none'}} type="file" accept=".csv,.xls,.xlsx" onChange={e=>e.target.files?.[0]&&load(e.target.files[0])}/></label></div></>}
 {tab==='products'&&<div className="card"><div className="toprow"><div><h2>Resultados</h2><p className="muted">Risk Score explicable basado en campos faltantes.</p></div><label className="btn primary" style={{cursor:'pointer'}}>Importar<input style={{display:'none'}} type="file" accept=".csv,.xls,.xlsx" onChange={e=>e.target.files?.[0]&&load(e.target.files[0])}/></label></div><div className="results"><table><thead><tr><th>PRODUCTO</th><th>RISK SCORE</th><th>PRIORIDAD</th><th>REVISAR</th></tr></thead><tbody>{results.map((r,i)=><tr key={i}><td><b>{r.name}</b></td><td>{r.score}/100</td><td><span className={'pill '+(r.score>=60?'high':r.score>=30?'medium':'low')}>{r.priority}</span></td><td>{r.missing.join(', ')||'Sin faltantes básicos'}</td></tr>)}</tbody></table></div></div>}
 {tab==='history'&&<div className="card"><h2>Historial</h2><p>Hoy · Catálogo demo · {results.length} productos · Risk Score medio {avg}/100</p><p className="muted">En producción, este módulo se conecta a Supabase/PostgreSQL para guardar ejecuciones por usuario y tienda.</p></div>}
 {tab==='reports'&&<div className="card"><h2>Informes</h2><p className="muted">Exporta los resultados actuales a Excel.</p><button className="btn primary" onClick={exportReport}>Descargar informe .xlsx</button></div>}
 {tab==='settings'&&<div className="card"><h2>Ajustes</h2><p><b>Cuenta demo</b></p><p className="muted">Autenticación real prevista con Supabase Auth; pagos con Stripe; email con Resend; analítica con PostHog.</p><div className="notice">Las claves y secretos deben configurarse como variables de entorno, nunca incluirse en el repositorio.</div></div>}
 </section></div></main>
}
