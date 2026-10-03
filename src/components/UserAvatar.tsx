import React, { useState } from 'react';

export const AVATARS_BY_NAME: Record<string, string> = {
  'Arun Nair': 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=160&auto=format&fit=crop&q=80',
  'Priya Mehta': 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=160&auto=format&fit=crop&q=80',
  'Neha Sharma': 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=160&auto=format&fit=crop&q=80',
  'Rajesh Sen': 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=160&auto=format&fit=crop&q=80',
  'Ravi Kumar': 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=160&auto=format&fit=crop&q=80',
  'Vikram Malhotra': 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=160&auto=format&fit=crop&q=80',
  'Karthik Reddy': 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=160&auto=format&fit=crop&q=80',
  'Meera Patel': 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=160&auto=format&fit=crop&q=80',
  'Sneha Desai': 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=160&auto=format&fit=crop&q=80',
  'Rohan Sharma': 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=160&auto=format&fit=crop&q=80'
};

export const getAvatarForName = (name: string): string | undefined => {
  if (!name) return undefined;
  // Exact match
  if (AVATARS_BY_NAME[name]) return AVATARS_BY_NAME[name];
  // Substring match (e.g., "Priya Mehta (Office Manager)" or "Vikram Malhotra (CFO)")
  for (const [key, url] of Object.entries(AVATARS_BY_NAME)) {
    if (name.toLowerCase().includes(key.toLowerCase())) {
      return url;
    }
  }
  return undefined;
};

interface UserAvatarProps {
  name: string;
  avatarUrl?: string;
  size?: number;
  shape?: 'circle' | 'rounded';
  border?: string;
  className?: string;
  style?: React.CSSProperties;
}

export const UserAvatar: React.FC<UserAvatarProps> = ({
  name,
  avatarUrl,
  size = 36,
  shape = 'circle',
  border = '1px solid rgba(0, 0, 0, 0.08)',
  className = '',
  style = {}
}) => {
  const [imgError, setImgError] = useState(false);

  const resolvedUrl = avatarUrl || getAvatarForName(name);

  const initials = name
    ? name
        .replace(/\(.*?\)/g, '')
        .trim()
        .split(' ')
        .filter(Boolean)
        .slice(0, 2)
        .map(part => part[0].toUpperCase())
        .join('')
    : 'U';

  // Palette hash for initials fallback
  const charCode = (name.charCodeAt(0) || 65) + (name.charCodeAt(name.length - 1) || 90);
  const bgColors = ['#f3f4f6', '#ede9fe', '#e0e7ff', '#fce7f3', '#fee2e2', '#fef3c7', '#dcfce7'];
  const textColors = ['#374151', '#6b21a8', '#3730a3', '#9d174d', '#991b1b', '#92400e', '#166534'];
  const paletteIndex = charCode % bgColors.length;

  const borderRadius = shape === 'circle' ? '50%' : 'var(--radius-sm, 6px)';

  if (resolvedUrl && !imgError) {
    return (
      <img
        src={resolvedUrl}
        alt={name}
        onError={() => setImgError(true)}
        className={className}
        style={{
          width: size,
          height: size,
          minWidth: size,
          minHeight: size,
          borderRadius,
          objectFit: 'cover',
          border,
          display: 'inline-block',
          verticalAlign: 'middle',
          ...style
        }}
      />
    );
  }

  return (
    <div
      className={className}
      title={name}
      style={{
        width: size,
        height: size,
        minWidth: size,
        minHeight: size,
        borderRadius,
        background: bgColors[paletteIndex],
        color: textColors[paletteIndex],
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: Math.max(10, Math.round(size * 0.38)),
        fontWeight: 700,
        fontFamily: 'var(--font-mono, monospace)',
        border,
        userSelect: 'none',
        ...style
      }}
    >
      {initials}
    </div>
  );
};
