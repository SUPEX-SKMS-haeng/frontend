import i18next from 'i18next';
import { initReactI18next } from 'react-i18next';

import ko_common from './ko/common.json';

export const defaultNS = 'common';

export const i18nInitialize = () => {
  i18next.use(initReactI18next).init({
    lng: 'ko',
    fallbackLng: 'ko',
    debug: false,
    resources: {
      ko: {
        common: ko_common,
      },
    },
    defaultNS,
  });
};
