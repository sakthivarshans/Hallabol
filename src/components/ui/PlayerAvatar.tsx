import { getInitials } from '@/src/utils/format';

interface PlayerAvatarProps {
  slug?: string;
  name: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}

const SIZE_CLASSES: Record<NonNullable<PlayerAvatarProps['size']>, string> = {
  sm: 'h-9 w-9 text-xs',
  md: 'h-12 w-12 text-sm',
  lg: 'h-16 w-16 text-lg',
  xl: 'h-24 w-24 text-2xl',
};

export function PlayerAvatar({
  name,
  size = 'md',
  className = '',
}: PlayerAvatarProps) {
  return (
    <div
      className={`relative shrink-0 overflow-hidden rounded-2xl border border-[#EA1A85]/30 bg-gradient-to-br from-[#254AA5] via-[#141A4A] to-[#EA1A85] flex items-center justify-center font-heading font-bold text-white select-none ${SIZE_CLASSES[size]} ${className}`}
    >
      <span aria-hidden="true" title={name}>
        {getInitials(name)}
      </span>
    </div>
  );
}
