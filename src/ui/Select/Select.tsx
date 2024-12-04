import React, { useState } from 'react';
import styles from './Select.module.css';
import { useOutsideClick } from 'hooks';

interface Option<T> {
  value: T;
  label: React.ReactNode;
}

interface SelectProps<T> {
  options: Option<T>[];
  value: T;
  onChange: (value: T) => void;
}

export const Select = <T extends string | number>({ options, value, onChange }: SelectProps<T>) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = React.useRef<HTMLUListElement>(null);

  const handleToggle = () => setIsOpen(!isOpen);

  const handleClose = () => setIsOpen(false);

  const handleSelect = (option: T) => {
    onChange(option);
    setIsOpen(false);
  };

  const selectedOption = options.find((option) => option.value === value);

  useOutsideClick(dropdownRef, handleClose);

  return (
    <div className={styles.select}>
      <div className={styles.header} onClick={handleToggle}>
        <div className={styles.label}>{selectedOption?.label}</div>
        <svg
          className={`${styles.icon} ${isOpen ? styles.iconOpen : ''}`}
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          width="16"
          height="16"
        >
          <path d="M7 10l5 5 5-5H7z" />
        </svg>
      </div>
      {isOpen && (
        <ul className={styles.dropdown} ref={dropdownRef}>
          {options.map((option) => (
            <li key={option.value} className={styles.option} onClick={() => handleSelect(option.value)}>
              {option.label}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};
