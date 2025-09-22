import appConfig from '../app.json';

export function getApiBaseUrl(): string {
  const fromExtra = (appConfig as any)?.expo?.extra?.apiBaseUrl?.trim();
  if (fromExtra) return stripTrailingSlash(fromExtra);
  return '';
}

function stripTrailingSlash(url: string) {
  return url.endsWith('/') ? url.slice(0, -1) : url;
}

export const API_BASE_URL = getApiBaseUrl();

export const config = {
  apiBaseUrl: API_BASE_URL,
};
