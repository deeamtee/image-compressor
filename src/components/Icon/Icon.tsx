import { ReactComponent as DownloadIcon }  from './icons/download.svg';

const icons = {
  download: DownloadIcon,
};

type Props = {
  variant: keyof typeof icons;
} & React.SVGProps<SVGSVGElement>;

export const Icon = ({ variant, ...props }: Props) => {
  const IconComponent = icons[variant];

  if (!IconComponent) {
    return null;
  }

  return <div><IconComponent {...props} /></div>; 
};
