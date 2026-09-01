import test from 'node:test';
import assert from 'node:assert/strict';
import { documentationFor, SOURCES } from '../lib/documentation';

const product = {
  name: 'Example product',
  manufacturer: '',
  responsible: '',
  warning: '',
};

const expectations = {
  es: ['Identificación del fabricante', 'Dato no aportado', 'Operador económico establecido en la UE'],
  en: ['Manufacturer identification', 'Data not supplied', 'EU-established economic operator'],
  fr: ['Identification du fabricant', 'Donnée non fournie', 'Opérateur économique établi dans l’UE'],
  de: ['Herstelleridentifikation', 'Angabe nicht vorhanden', 'In der EU niedergelassener Wirtschaftsakteur'],
  it: ['Identificazione del fabbricante', 'Dato non fornito', 'Operatore economico stabilito nell’UE'],
  pt: ['Identificação do fabricante', 'Dado não fornecido', 'Operador económico estabelecido na UE'],
} as const;

test('EU documentary guidance is structurally localized in all supported languages', () => {
  for (const [language, [manufacturerTitle, missingStatus, operatorTitle]] of Object.entries(expectations)) {
    const actions = documentationFor(product, 'EU', language as keyof typeof expectations);
    assert.equal(actions[0].title, manufacturerTitle, language);
    assert.equal(actions[0].status, missingStatus, language);
    assert.equal(actions[1].title, operatorTitle, language);
    assert.equal(actions.length, 7, language);
  }
});

test('localization never alters the official source URLs', () => {
  for (const language of Object.keys(expectations) as (keyof typeof expectations)[]) {
    const actions = documentationFor(product, 'EU', language);
    assert.equal(actions[0].source, SOURCES.euGpsr, language);
    assert.equal(actions[5].source, SOURCES.euCe, language);
    for (const action of actions) assert.match(action.source, /^https:\/\//);
  }
});
