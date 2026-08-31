import type { Language } from './landing-i18n';
import type { MarketCode } from './markets';

export type MarketDisplay = { name: string; shortName: string; operator: string; operatorLong: string };

const eu: Record<Language, MarketDisplay> = {
  es:{name:'Unión Europea',shortName:'UE',operator:'Operador responsable UE',operatorLong:'Operador económico responsable en la UE'},
  en:{name:'European Union',shortName:'EU',operator:'EU responsible operator',operatorLong:'Responsible economic operator in the EU'},
  fr:{name:'Union européenne',shortName:'UE',operator:'Opérateur responsable UE',operatorLong:'Opérateur économique responsable dans l’UE'},
  de:{name:'Europäische Union',shortName:'EU',operator:'Verantwortlicher EU-Wirtschaftsakteur',operatorLong:'Verantwortlicher Wirtschaftsakteur in der EU'},
  it:{name:'Unione europea',shortName:'UE',operator:'Operatore responsabile UE',operatorLong:'Operatore economico responsabile nell’UE'},
  pt:{name:'União Europeia',shortName:'UE',operator:'Operador responsável na UE',operatorLong:'Operador económico responsável na UE'},
};

const names: Record<MarketCode, Record<Language, [string,string]>> = {
  EU:Object.fromEntries(Object.entries(eu).map(([language,value]) => [language,[value.name,value.shortName]])) as Record<Language,[string,string]>,
  US:{es:['Estados Unidos','EE. UU.'],en:['United States','US'],fr:['États-Unis','É.-U.'],de:['Vereinigte Staaten','USA'],it:['Stati Uniti','USA'],pt:['Estados Unidos','EUA']},
  CN:{es:['China','China'],en:['China','China'],fr:['Chine','Chine'],de:['China','China'],it:['Cina','Cina'],pt:['China','China']},
  GB:{es:['Reino Unido','Reino Unido'],en:['United Kingdom','UK'],fr:['Royaume-Uni','R.-U.'],de:['Vereinigtes Königreich','UK'],it:['Regno Unito','UK'],pt:['Reino Unido','RU']},
  JP:{es:['Japón','Japón'],en:['Japan','Japan'],fr:['Japon','Japon'],de:['Japan','Japan'],it:['Giappone','Giappone'],pt:['Japão','Japão']},
};

const nonEuOperator: Record<Exclude<MarketCode,'EU'>, Record<Language,[string,string]>> = {
  US:{es:['Importador de registro','Importador o emisor del certificado en EE. UU.'],en:['Importer of record','US importer or certificate issuer'],fr:['Importateur officiel','Importateur ou émetteur du certificat aux États-Unis'],de:['Importeur of Record','US-Importeur oder Zertifikatsaussteller'],it:['Importatore registrato','Importatore USA o soggetto che emette il certificato'],pt:['Importador registado','Importador ou emissor do certificado nos EUA']},
  CN:{es:['Importador en China','Importador u operador responsable en China'],en:['Importer in China','Importer or responsible operator in China'],fr:['Importateur en Chine','Importateur ou opérateur responsable en Chine'],de:['Importeur in China','Importeur oder verantwortlicher Akteur in China'],it:['Importatore in Cina','Importatore o operatore responsabile in Cina'],pt:['Importador na China','Importador ou operador responsável na China']},
  GB:{es:['Importador en GB','Importador o persona responsable en Gran Bretaña'],en:['Importer in Great Britain','Importer or responsible person in Great Britain'],fr:['Importateur en Grande-Bretagne','Importateur ou personne responsable en Grande-Bretagne'],de:['Importeur in Großbritannien','Importeur oder verantwortliche Person in Großbritannien'],it:['Importatore in Gran Bretagna','Importatore o persona responsabile in Gran Bretagna'],pt:['Importador na Grã-Bretanha','Importador ou pessoa responsável na Grã-Bretanha']},
  JP:{es:['Importador en Japón','Importador o empresa notificante en Japón'],en:['Importer in Japan','Importer or notifying company in Japan'],fr:['Importateur au Japon','Importateur ou entreprise déclarante au Japon'],de:['Importeur in Japan','Importeur oder meldendes Unternehmen in Japan'],it:['Importatore in Giappone','Importatore o impresa notificante in Giappone'],pt:['Importador no Japão','Importador ou empresa notificante no Japão']},
};

export function marketDisplayFor(language: Language, code: MarketCode): MarketDisplay {
  if (code === 'EU') return eu[language];
  const [name, shortName] = names[code][language];
  const [operator, operatorLong] = nonEuOperator[code][language];
  return { name, shortName, operator, operatorLong };
}
