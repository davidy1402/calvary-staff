export interface AppHeaderAppearance {
  logoClass: string;
  paddingClass: string;
  brandClass: string;
  titleClass: string;
}

export const getAppHeaderAppearance = (seniorCare: boolean): AppHeaderAppearance =>
  seniorCare
    ? {
        logoClass: 'w-10 h-10',
        paddingClass: 'px-5 pb-4',
        brandClass: 'text-sm',
        titleClass: 'text-2xl',
      }
    : {
        logoClass: 'w-8 h-8',
        paddingClass: 'px-4 md:px-6 pb-3',
        brandClass: 'text-xs',
        titleClass: 'text-lg',
      };
