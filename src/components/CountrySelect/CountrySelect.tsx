import { useState } from 'react';
import i18n from 'i18next';
import { Icon, Select } from 'ui';

type Option = { value: string; label: React.ReactNode };

const getShortLang = (lang: string) => lang.split('-')[0];

const getValidLanguage = (lang: string, options: Option[]) => {
  const shortLang = getShortLang(lang);
  const isValid = options.some((option) => option.value === shortLang);
  return isValid ? shortLang : 'en';
};

const options: Option[] = [
  { value: 'en', label: <Icon variant="GB" /> }, // English
  { value: 'ru', label: <Icon variant="RU" /> }, // Russian
  { value: 'zh', label: <Icon variant="CN" /> }, // Chinese
  { value: 'es', label: <Icon variant="ES" /> }, // Spanish
  { value: 'fr', label: <Icon variant="FR" /> }, // French
  { value: 'de', label: <Icon variant="DE" /> }, // German
  { value: 'ja', label: <Icon variant="JP" /> }, // Japanese
  { value: 'ko', label: <Icon variant="KR" /> }, // Korean
  { value: 'nl', label: <Icon variant="NL" /> }, // Dutch
  { value: 'pl', label: <Icon variant="PL" /> }, // Polish
  { value: 'sv', label: <Icon variant="SE" /> }, // Swedish
];

export const CountrySelect = () => {
  const [language, setLanguage] = useState<string>(getValidLanguage(i18n.language, options));

  const handleChangeLanguage = (lang: string) => {
    setLanguage(lang);
    i18n.changeLanguage(lang);
  };

  return <Select options={options} value={language} onChange={handleChangeLanguage} />;
};
