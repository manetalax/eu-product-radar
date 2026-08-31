import type { Language } from './landing-i18n';

type UploadCopy = {
  singleFileOnly: string;
};

export const uploadCopy: Record<Language, UploadCopy> = {
  es: { singleFileOnly: 'Importa un solo archivo cada vez. No se ha procesado ninguno de los archivos arrastrados.' },
  en: { singleFileOnly: 'Import one file at a time. None of the dropped files was processed.' },
  fr: { singleFileOnly: 'Importez un seul fichier à la fois. Aucun des fichiers déposés n’a été traité.' },
  de: { singleFileOnly: 'Importiere jeweils nur eine Datei. Keine der abgelegten Dateien wurde verarbeitet.' },
  it: { singleFileOnly: 'Importa un solo file alla volta. Nessuno dei file trascinati è stato elaborato.' },
  pt: { singleFileOnly: 'Importe apenas um ficheiro de cada vez. Nenhum dos ficheiros largados foi processado.' },
};
