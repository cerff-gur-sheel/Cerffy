import { CryptoDigestAlgorithm, digestStringAsync } from "expo-crypto";
import { getItemAsync, setItemAsync } from "expo-secure-store";
const SERVER_URL = "https://music.cerffgursheel.party";
const USER_CREDENTIALS_KEY = "user_credentials";

/**
 * get authentication parameters for API requests
 * @throws Error if credentials are not found or if hashing fails
 * @returns URLSearchParams containing authentication parameters or null if credentials are missing
 */
export const getAuthParams = async (): Promise<URLSearchParams | null> => {
  const credentials = await getItemAsync(USER_CREDENTIALS_KEY);
  if (!credentials) return null;

  const { user, pass } = JSON.parse(credentials);
  const salt = Math.random().toString(36).substring(2, 15);
  const token = await digestStringAsync(CryptoDigestAlgorithm.MD5, pass + salt);

  return new URLSearchParams({
    u: user,
    s: salt,
    t: token,
    v: "0.0.1",
    c: "Cerffy",
    f: "json",
  });
};

/**
 * save user credentials securely
 * @param user - username to save
 * @param pass - password to save
 * @throws Error if saving credentials fails
 */
export const saveCredentials = async (user: string, pass: string) => {
  await setItemAsync(USER_CREDENTIALS_KEY, JSON.stringify({ user, pass }));
};

/**
 * build a complete URL for API requests
 * @param endpoint - API endpoint to call
 * @param params - URLSearchParams containing authentication and other parameters
 * @param extra - additional query parameters to include in the URL
 * @returns fully constructed URL as a string
 */
export const buildUrl = (
  endpoint: string,
  params: URLSearchParams,
  extra: Record<string, string> = {},
): string => {
  const url = new URL(`${SERVER_URL}/${endpoint}`);
  params.forEach((value, key) => url.searchParams.append(key, value));
  Object.entries(extra).forEach(([key, value]) =>
    url.searchParams.append(key, value),
  );
  return url.toString();
};

/**
 * ping the server to check if it's reachable and authentication parameters are valid
 * @throws Error if authentication parameters are missing or if the network response is not ok
 * @returns true if the server responds successfully, otherwise throws an error
 */
export const pingServer = async (): Promise<boolean> => {
  const params = await getAuthParams();
  if (!params) throw new Error("Authentication parameters not found");

  const response = await fetch(buildUrl("ping.view", params));
  if (!response.ok) throw new Error("Network response was not ok");

  return response.json();
};
