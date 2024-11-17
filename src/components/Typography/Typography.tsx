import React, { FC } from 'react';
import cn from 'clsx';
import styles from './Typography.module.css';

type TypographyProps = {
  size?: 's' | 'm' | 'l' | 'xl';
  color?: 'primary' | 'dark' | string;
  weight?: 'regular' | 'semibold' | 'bold';
  as?: keyof JSX.IntrinsicElements;
  className?: string;
  children?: React.ReactNode;
};

export const Typography: FC<TypographyProps> = ({
  size ='m',
  color,
  weight,
  as: Text = 'p',
  className = '',
  children,
}) => {
  const colorClassMap: Record<string, string | undefined> = {
    primary: styles['color-primary'],
    dark: styles['color-dark'],
  };

  const colorClass = colorClassMap[color ?? ''];

  return (
    <Text
      className={cn(
        styles.typography,
        size && styles[`size-${size}`],
        weight && styles[`weight-${weight}`],
        colorClass,
        className
      )}
    >
      {children}
    </Text>
  );
};
