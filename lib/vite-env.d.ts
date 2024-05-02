/// <reference types="vite/client" />

declare global {
  interface NextFetchRequestConfig {
    revalidate?: number | false;
    tags?: string[];
  }
  interface RequestInit {
    next?: NextFetchRequestConfig | undefined;
  }
}
