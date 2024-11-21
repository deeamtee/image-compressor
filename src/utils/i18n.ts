import i18next from 'i18next';
import { initReactI18next } from 'react-i18next';
import LngDetector from 'i18next-browser-languagedetector';

const resources = {
  en: {
    translation: {
      title: '<dark>Image</dark> <primary>Compressor</primary>',
      dragndrop: 'Drag and drop an image here',
      download: 'Download',
    },
  },
  ru: {
    translation: {
      title: '<dark>Сжатие</dark> <primary>Картинок</primary>',
      dragndrop: 'Перетащите изображение сюда',
      download: 'Скачать',
    },
  },
  zh: {
    translation: {
      title: '<dark>图片</dark> <primary>压缩器</primary>',
      dragndrop: '拖放图片到此处',
      download: '下载',
    },
  },
  es: {
    translation: {
      title: '<dark>Compresor</dark> <primary>de Imágenes</primary>',
      dragndrop: 'Arrastra y suelta una imagen aquí',
      download: 'Descargar',
    },
  },
  pt: {
    translation: {
      title: '<dark>Compressor</dark> <primary>de Imagens</primary>',
      dragndrop: 'Arraste e solte uma imagem aqui',
      download: 'Baixar',
    },
  },
  fr: {
    translation: {
      title: "<dark>Compresseur</dark> <primary>d'Images</primary>",
      dragndrop: 'Glissez-déposez une image ici',
      download: 'Télécharger',
    },
  },
  ar: {
    translation: {
      title: '<dark>ضاغط</dark> <primary>الصور</primary>',
      dragndrop: 'اسحب وأفلت صورة هنا',
      download: 'تحميل',
    },
  },
  de: {
    translation: {
      title: '<dark>Bild</dark> <primary>Kompressor</primary>',
      dragndrop: 'Ziehen Sie ein Bild hierher',
      download: 'Herunterladen',
    },
  },
  ja: {
    translation: {
      title: '<dark>画像</dark> <primary>圧縮ツール</primary>',
      dragndrop: '画像をここにドラッグアンドドロップ',
      download: 'ダウンロード',
    },
  },
  it: {
    translation: {
      title: '<dark>Compressore</dark> <primary>di Immagini</primary>',
      dragndrop: "Trascina e rilascia un'immagine qui",
      download: 'Scarica',
    },
  },
  ko: {
    translation: {
      title: '<dark>이미지</dark> <primary>압축기</primary>',
      dragndrop: '이미지를 여기에 드래그 앤 드롭하세요',
      download: '다운로드',
    },
  },
  nl: {
    translation: {
      title: '<dark>Afbeelding</dark> <primary>Compressor</primary>',
      dragndrop: 'Sleep een afbeelding hierheen',
      download: 'Downloaden',
    },
  },
  tr: {
    translation: {
      title: '<dark>Görüntü</dark> <primary>Kompressörü</primary>',
      dragndrop: 'Bir resmi buraya sürükleyip bırakın',
      download: 'İndir',
    },
  },
  hi: {
    translation: {
      title: '<dark>छवि</dark> <primary>संपीड़क</primary>',
      dragndrop: 'यहां एक छवि खींचें और छोड़ें',
      download: 'डाउनलोड करें',
    },
  },
  id: {
    translation: {
      title: '<dark>Kompresor</dark> <primary>Gambar</primary>',
      dragndrop: 'Seret dan lepas gambar di sini',
      download: 'Unduh',
    },
  },
  pl: {
    translation: {
      title: '<dark>Kompresor</dark> <primary>Obrazów</primary>',
      dragndrop: 'Przeciągnij i upuść obraz tutaj',
      download: 'Pobierz',
    },
  },
  sv: {
    translation: {
      title: '<dark>Bild</dark> <primary>Kompressor</primary>',
      dragndrop: 'Dra och släpp en bild här',
      download: 'Ladda ner',
    },
  },
  uk: {
    translation: {
      title: '<dark>Стискач</dark> <primary>Зображень</primary>',
      dragndrop: 'Перетягніть зображення сюди',
      download: 'Завантажити',
    },
  },
  vi: {
    translation: {
      title: '<dark>Bộ Nén</dark> <primary>Hình Ảnh</primary>',
      dragndrop: 'Kéo và thả hình ảnh vào đây',
      download: 'Tải về',
    },
  },
  th: {
    translation: {
      title: '<dark>ตัวบีบอัด</dark> <primary>ภาพ</primary>',
      dragndrop: 'ลากและวางรูปภาพที่นี่',
      download: 'ดาวน์โหลด',
    },
  },
};

i18next.use(initReactI18next).use(LngDetector).init({
  fallbackLng: 'en',
  resources,
});
