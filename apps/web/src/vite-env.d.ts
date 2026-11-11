interface ImportMetaEnv {
  // Empty (default): same-origin requests to /api (Vite proxy in dev, nginx in Docker).
  // Absolute URL (e.g. http://localhost:3000): cross-origin requests, used for the CORS demo.
  readonly VITE_API_BASE_URL?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
