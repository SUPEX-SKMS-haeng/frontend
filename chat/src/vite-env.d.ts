/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_APP_ENV: 'local' | 'public';
  readonly VITE_ADMIN_SETTINGS_URL: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
