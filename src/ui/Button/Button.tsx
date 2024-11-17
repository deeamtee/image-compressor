import React from 'react';
import cn from 'clsx';
import styles from './Button.module.css';

type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant: 'accent' | 'underline';
};

export const Button: React.FC<ButtonProps> = ({ variant = 'accent', children, className, ...props }) => {
  return (
    <button className={cn(styles.button, styles[variant], className)} {...props}>
      {children}
    </button>
  );
};
