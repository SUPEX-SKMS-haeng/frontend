import i18next from 'i18next';
import { initReactI18next } from 'react-i18next';

import koAdmin from '@/locale/ko/admin.json';
import koChat from '@/locale/ko/chat.json';
import koAuth from '@/locale/ko/auth.json';

export const defaultNS = 'auth';

export const i18nInitialize = () => {
  i18next.use(initReactI18next).init({
    lng: 'ko',
    fallbackLng: 'ko',
    debug: false,
    resources: {
      ko: {
        admin: koAdmin,
        chat: koChat,
        auth: koAuth,
      },
    },
    defaultNS,
  });
};
