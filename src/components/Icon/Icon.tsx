import { ReactComponent as DownloadIcon } from './icons/download.svg';
import { ReactComponent as Picture } from './icons/picture.svg';
import { ReactComponent as File } from './icons/file.svg';
import { ReactComponent as Dell } from './icons/dell.svg';
import { ReactComponent as Progress } from './icons/progress.svg';

const icons = {
  download: DownloadIcon,
  picture: Picture,
  file: File,
  dell: Dell,
  progress: Progress,
};

type Props = {
  variant: keyof typeof icons;
} & React.SVGProps<SVGSVGElement>;

export const Icon = ({ variant, ...props }: Props) => {
  const IconComponent = icons[variant];

  if (!IconComponent) {
    return null;
  }

  return (
    <div>
      <IconComponent {...props} />
    </div>
  );
};
