import React, { FC } from 'react';
import cn from 'clsx';
import styles from './Typography.module.css';

type TypographyProps = {
  size?: 's' | 'm' | 'l' | 'xl';
  color?: 'primary' | 'dark' | string;
  weight?: 'regular' | 'semibold' | 'bold';
  as?: keyof JSX.IntrinsicElements;
  className?: string;
  children: React.ReactNode;
};

export const Typography: FC<TypographyProps> = ({
  size = 'm',
  color = 'primary',
  weight= "regular",
  as: Text = 'p',
  className = '',
  children,
}) => {
  return (
    <Text className={cn(styles.typography, styles[`size-${size}`], styles[`weight-${weight}`], className)} style={{ color }}>
      {children}
    </Text>
  );
};
