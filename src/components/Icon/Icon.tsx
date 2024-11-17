import { ICONS } from './Icon.consts';

type Props = {
  variant: keyof typeof ICONS;
} & React.SVGProps<SVGSVGElement>;

export const Icon = ({ variant, ...props }: Props) => {
  const IconComponent = ICONS[variant];

  if (!IconComponent) {
    return null;
  }

  return <IconComponent {...props} />;
};
