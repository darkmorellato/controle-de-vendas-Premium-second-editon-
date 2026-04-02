/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_FIREBASE_API_KEY: string;
  readonly VITE_FIREBASE_AUTH_DOMAIN: string;
  readonly VITE_FIREBASE_PROJECT_ID: string;
  readonly VITE_FIREBASE_STORAGE_BUCKET: string;
  readonly VITE_FIREBASE_MESSAGING_SENDER_ID: string;
  readonly VITE_FIREBASE_APP_ID: string;
  readonly VITE_FIREBASE_MEASURE_ID?: string;
  readonly VITE_ADM_NAME?: string;
  readonly VITE_ADM_HASH?: string;
  readonly VITE_MANAGER_HASH?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}