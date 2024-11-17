import i18next from 'i18next';
import { initReactI18next } from 'react-i18next';
import LngDetector from 'i18next-browser-languagedetector';

const resources = {
  en: {
    translation: {
      title: '<dark>Images</dark> <primary>Compressor</primary>',
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
};

i18next.use(initReactI18next).use(LngDetector).init({
  fallbackLng: 'en',
  resources,
});
