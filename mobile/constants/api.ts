import { Platform } from "react-native";
import Constants from "expo-constants";

const API_PORT = 5000;

function normalizeBaseUrl(url: string): string {
  return url.trim().replace(/\/$/, "").replace(/\/api$/, "");
}

function getConfiguredApiUrl(): string | null {
  const fromEnv = process.env.EXPO_PUBLIC_API_URL;
  if (fromEnv) return normalizeBaseUrl(fromEnv);

  const fromExtra = Constants.expoConfig?.extra?.apiUrl as string | undefined;
  if (fromExtra) return normalizeBaseUrl(fromExtra);

  return null;
}

function getDevServerHost(): string | null {
  const hostUri = Constants.expoConfig?.hostUri;
  if (hostUri) {
    return hostUri.split(":")[0];
  }

  const legacyHost =
    (Constants as { manifest2?: { extra?: { expoGo?: { debuggerHost?: string } } } }).manifest2?.extra?.expoGo?.debuggerHost ??
    (Constants as { manifest?: { debuggerHost?: string } }).manifest?.debuggerHost;

  if (legacyHost) {
    return legacyHost.split(":")[0];
  }

  return null;
}

function resolveApiBase(): string {
  const configured = getConfiguredApiUrl();
  if (configured) return configured;

  if (__DEV__) {
    const devHost = getDevServerHost();
    if (devHost) return `http://${devHost}:${API_PORT}`;
    if (Platform.OS === "android") return `http://10.0.2.2:${API_PORT}`;
    return `http://localhost:${API_PORT}`;
  }

  return "";
}

export const API_BASE = resolveApiBase();
export const API_URL = API_BASE ? `${API_BASE}/api` : "";
export const IS_API_CONFIGURED = Boolean(API_BASE);
