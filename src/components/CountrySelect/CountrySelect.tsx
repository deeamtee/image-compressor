import { useState } from 'react';
import { Icon, Select } from 'ui';

export const CountrySelect = () => {
  const [language, setLanguage] = useState<string>('RU');

  const options = [
    { value: 'RU', label: <Icon variant="RU" /> },
    { value: 'NL', label: <Icon variant="NL" /> },
    { value: 'US', label: <Icon variant="US" /> },
    { value: 'CN', label: <Icon variant="CN" /> },
    { value: 'JP', label: <Icon variant="JP" /> },
    { value: 'DE', label: <Icon variant="DE" /> },
  ];

  return <Select options={options} value={language} onChange={setLanguage} />;
};
