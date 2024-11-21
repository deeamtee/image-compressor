import { useState } from 'react';
import i18n from 'i18next';
import { Icon, Select } from 'ui';

export const CountrySelect = () => {
  const [language, setLanguage] = useState<string>('ru');

  const handleChangeLanguage = (lang: string) => {
    setLanguage(lang);
    i18n.changeLanguage(lang);
  };

  const options = [
    { value: 'en', label: <Icon variant="GB" /> },
    { value: 'us', label: <Icon variant="US" /> },
    { value: 'ru', label: <Icon variant="RU" /> },
    { value: 'zh', label: <Icon variant="CN" /> },
    { value: 'es', label: <Icon variant="ES" /> },
    { value: 'pt', label: <Icon variant="PT" /> },
    { value: 'fr', label: <Icon variant="FR" /> },
    { value: 'ar', label: <Icon variant="SA" /> },
    { value: 'de', label: <Icon variant="DE" /> },
    { value: 'ja', label: <Icon variant="JP" /> },
    { value: 'it', label: <Icon variant="IT" /> },
    { value: 'ko', label: <Icon variant="KR" /> },
    { value: 'nl', label: <Icon variant="NL" /> },
    { value: 'tr', label: <Icon variant="TR" /> },
    { value: 'hi', label: <Icon variant="IN" /> },
    { value: 'id', label: <Icon variant="ID" /> },
    { value: 'pl', label: <Icon variant="PL" /> },
    { value: 'sv', label: <Icon variant="SE" /> },
    { value: 'uk', label: <Icon variant="UA" /> },
    { value: 'vi', label: <Icon variant="VN" /> },
  ];

  return <Select options={options} value={language} onChange={handleChangeLanguage} />;
};
