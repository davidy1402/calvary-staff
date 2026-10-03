import React from 'react';

interface ChurchLogoProps {
  className?: string;
  alt?: string;
}

export const ChurchLogo: React.FC<ChurchLogoProps> = ({
  className = 'w-8 h-8 object-contain shrink-0',
  alt = 'CCCJB Logo',
}) => {
  const base = import.meta.env.BASE_URL || './';
  const logoLight = `${base}logo.png`;
  const logoDark = `${base}logo-white.png`;

  return (
    <>
      <img
        src={logoLight}
        alt={alt}
        className={`${className} dark:hidden`}
        onError={(e) => {
          // Fallback to relative path if base fails
          const target = e.currentTarget;
          if (target.src !== './logo.png') {
            target.src = './logo.png';
          }
        }}
      />
      <img
        src={logoDark}
        alt={alt}
        className={`${className} hidden dark:block`}
        onError={(e) => {
          const target = e.currentTarget;
          if (target.src !== './logo-white.png') {
            target.src = './logo-white.png';
          }
        }}
      />
    </>
  );
};
