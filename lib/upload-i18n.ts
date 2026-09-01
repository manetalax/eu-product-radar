import type { Language } from './landing-i18n';

type UploadCopy = {
  singleFileOnly: string;
  cameraAria: string;
  takePhoto: string;
};

export const uploadCopy: Record<Language, UploadCopy> = {
  es: {
    singleFileOnly: 'Importa un solo archivo cada vez. No se ha procesado ninguno de los archivos arrastrados.',
    cameraAria: 'Tomar una foto del producto con la cámara',
    takePhoto: 'Tomar foto',
  },
  en: {
    singleFileOnly: 'Import one file at a time. None of the dropped files was processed.',
    cameraAria: 'Take a product photo with the camera',
    takePhoto: 'Take photo',
  },
  fr: {
    singleFileOnly: 'Importez un seul fichier à la fois. Aucun des fichiers déposés n’a été traité.',
    cameraAria: 'Prendre une photo du produit avec l’appareil photo',
    takePhoto: 'Prendre une photo',
  },
  de: {
    singleFileOnly: 'Importiere jeweils nur eine Datei. Keine der abgelegten Dateien wurde verarbeitet.',
    cameraAria: 'Ein Produktfoto mit der Kamera aufnehmen',
    takePhoto: 'Foto aufnehmen',
  },
  it: {
    singleFileOnly: 'Importa un solo file alla volta. Nessuno dei file trascinati è stato elaborato.',
    cameraAria: 'Scatta una foto del prodotto con la fotocamera',
    takePhoto: 'Scatta foto',
  },
  pt: {
    singleFileOnly: 'Importe apenas um ficheiro de cada vez. Nenhum dos ficheiros largados foi processado.',
    cameraAria: 'Tirar uma fotografia do produto com a câmara',
    takePhoto: 'Tirar fotografia',
  },
};
