import i18next from 'i18next';
import { initReactI18next } from 'react-i18next';
import LngDetector from 'i18next-browser-languagedetector';

const resources = {
  en: {
    translation: {
      filesDownloading: 'Files are downloading',
      your: 'Your',
      feedback: 'feedback',
      isValuableForUs: 'is valuable for us',
      openDownloadFolder: 'Open download folder',
      goBack: 'Go back',
      title: '<dark>Image</dark> <primary>Compressor</primary>',
      dragndrop: 'Drag and drop an image here',
      download: 'Download',
    },
  },
  ru: {
    translation: {
      filesDownloading: 'Файлы загружаются',
      your: 'Ваши',
      feedback: 'отзывы',
      isValuableForUs: 'ценны для нас',
      openDownloadFolder: 'Открыть папку с загрузками',
      goBack: 'Вернуться назад',
      title: '<dark>Сжатие</dark> <primary>Картинок</primary>',
      dragndrop: 'Перетащите изображение сюда',
      download: 'Скачать',
    },
  },
  zh: {
    translation: {
      filesDownloading: '文件正在下载',
      your: '您的',
      feedback: '反馈',
      isValuableForUs: '对我们很有价值',
      openDownloadFolder: '打开下载文件夹',
      goBack: '返回',
      title: '<dark>图片</dark> <primary>压缩器</primary>',
      dragndrop: '拖放图片到此处',
      download: '下载',
    },
  },
  es: {
    translation: {
      filesDownloading: 'Los archivos se están descargando',
      your: 'Tu',
      feedback: 'retroalimentación',
      isValuableForUs: 'es valioso para nosotros',
      openDownloadFolder: 'Abrir la carpeta de descargas',
      goBack: 'Volver atrás',
      title: '<dark>Compresor</dark> <primary>de Imágenes</primary>',
      dragndrop: 'Arrastra y suelta una imagen aquí',
      download: 'Descargar',
    },
  },
  fr: {
    translation: {
      filesDownloading: 'Les fichiers sont en cours de téléchargement',
      your: 'Votre',
      feedback: 'retour',
      isValuableForUs: 'est précieux pour nous',
      openDownloadFolder: 'Ouvrir le dossier de téléchargement',
      goBack: 'Retourner',
      title: "<dark>Compresseur</dark> <primary>d'Images</primary>",
      dragndrop: 'Glissez-déposez une image ici',
      download: 'Télécharger',
    },
  },
  de: {
    translation: {
      filesDownloading: 'Dateien werden heruntergeladen',
      your: 'Ihr',
      feedback: 'Feedback',
      isValuableForUs: 'ist für uns wertvoll',
      openDownloadFolder: 'Download-Ordner öffnen',
      goBack: 'Zurück gehen',
      title: '<dark>Bild</dark> <primary>Kompressor</primary>',
      dragndrop: 'Ziehen Sie ein Bild hierher',
      download: 'Herunterladen',
    },
  },
  ja: {
    translation: {
      filesDownloading: 'ファイルをダウンロード中',
      your: 'あなたの',
      feedback: 'フィードバック',
      isValuableForUs: 'は私たちにとって重要です',
      openDownloadFolder: 'ダウンロードフォルダを開く',
      goBack: '戻る',
      title: '<dark>画像</dark> <primary>圧縮ツール</primary>',
      dragndrop: '画像をここにドラッグアンドドロップ',
      download: 'ダウンロード',
    },
  },
  ko: {
    translation: {
      filesDownloading: '파일이 다운로드 중입니다',
      your: '귀하의',
      feedback: '피드백',
      isValuableForUs: '우리에게 귀중합니다',
      openDownloadFolder: '다운로드 폴더 열기',
      goBack: '뒤로 가기',
      title: '<dark>이미지</dark> <primary>압축기</primary>',
      dragndrop: '이미지를 여기에 드래그 앤 드롭하세요',
      download: '다운로드',
    },
  },
  nl: {
    translation: {
      filesDownloading: 'Bestanden worden gedownload',
      your: 'Jouw',
      feedback: 'feedback',
      isValuableForUs: 'is waardevol voor ons',
      openDownloadFolder: 'Open downloadmap',
      goBack: 'Ga terug',
      title: '<dark>Afbeelding</dark> <primary>Compressor</primary>',
      dragndrop: 'Sleep een afbeelding hierheen',
      download: 'Downloaden',
    },
  },
  pl: {
    translation: {
      filesDownloading: 'Pliki są pobierane',
      your: 'Twoje',
      feedback: 'opinie',
      isValuableForUs: 'są dla nas cenne',
      openDownloadFolder: 'Otwórz folder pobierania',
      goBack: 'Wróć',
      title: '<dark>Kompresor</dark> <primary>Obrazów</primary>',
      dragndrop: 'Przeciągnij i upuść obraz tutaj',
      download: 'Pobierz',
    },
  },
  sv: {
    translation: {
      filesDownloading: 'Filer laddas ner',
      your: 'Din',
      feedback: 'feedback',
      isValuableForUs: 'är värdefull för oss',
      openDownloadFolder: 'Öppna nedladdningsmappen',
      goBack: 'Gå tillbaka',
      title: '<dark>Bild</dark> <primary>Kompressor</primary>',
      dragndrop: 'Dra och släpp en bild här',
      download: 'Ladda ner',
    },
  },
};

i18next
  .use(LngDetector)
  .use(initReactI18next)
  .init({
    fallbackLng: 'en',
    resources,
    detection: {
      order: ['localStorage', 'navigator'],
      caches: ['localStorage'],
    },
  });
