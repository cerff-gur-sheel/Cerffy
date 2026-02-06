import { CryptoDigestAlgorithm, digestStringAsync } from "expo-crypto";
import { getItemAsync, setItemAsync } from "expo-secure-store";

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
  const url = new URL(`${SERVER_URL}/rest/${endpoint}`);
  params.forEach((value, key) => url.searchParams.append(key, value));
  Object.entries(extra).forEach(([key, value]) =>
    url.searchParams.append(key, value),
  );
  return url.toString();
};

//#region API connection and authentication

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
 * Ping the server to check if it's reachable and authentication parameters are valid.
 * @throws Error if authentication parameters are missing or if the network response is not ok.
 * @returns true if the server responds successfully, otherwise throws an error.
 */
export const pingServer = async (): Promise<boolean> => {
  const params = await getAuthParams();
  if (!params) throw new Error("Authentication parameters not found");

  const url = buildUrl("ping.view", params);
  const response = await fetch(url);

  if (!response.ok) {
    throw new Error(`Network response was not ok: ${response.status}`);
  }

  const data = await response.json();
  if (data?.["subsonic-response"]?.status === "ok") {
    return true;
  }
  throw new Error("Server responded with an error", { cause: data });
};

//#endregion

//#region Artist Details Fetching
export interface Artist {
  id: string;
  name: string;
  cover: string;
  albums: Album[];
  singles: Song[];
  biography?: string;
}

export const fetchArtists = async (): Promise<Artist[]> => {
  const params = await getAuthParams();
  if (!params) throw new Error("Authentication parameters not found");

  const response = await fetch(buildUrl("getArtists.view", params));
  const data = await response.json();
  const indexedArtists = data?.["subsonic-response"]?.artists?.index || [];

  const artistList: Artist[] = indexedArtists.flatMap((index: any) =>
    index.artist.map((artistData: any) => ({
      id: artistData.id,
      name: artistData.name,
      cover: buildUrl("getCoverArt.view", params, {
        id: artistData.coverArt,
        size: "300",
      }),
      albums: [],
      singles: [],
    })),
  );
  return artistList;
};

export const getArtistDetails = async (artistId: string): Promise<Artist> => {
  const params = await getAuthParams();
  if (!params) throw new Error("Authentication parameters not found");

  const response = await fetch(
    buildUrl("getArtist.view", params, { id: artistId }),
  );
  const data = await response.json();

  const artistData = data["subsonic-response"]?.artist;

  const albums =
    artistData?.album
      ?.filter((a: any) => a.albumType !== "Single" && a.albumType !== "EP")
      .map((a: any) => ({
        id: a.id,
        title: a.name,
        artist: {
          id: artistData.id,
          name: artistData.name,
          cover: buildUrl("getCoverArt.view", params, {
            id: artistData.coverArt,
            size: "300",
          }),
          albums: [],
          singles: [],
        },
        cover: buildUrl("getCoverArt.view", params, {
          id: a.coverArt,
          size: "300",
        }),
        songs: [],
        songCount: a.songCount,
      })) || [];

  const singles =
    artistData?.album
      ?.filter((a: any) => a.albumType === "Single" || a.albumType === "EP")
      .map((a: any) => ({
        id: a.id,
        title: a.name,
        artist: {
          id: artistData.id,
          name: artistData.name,
          cover: buildUrl("getCoverArt.view", params, {
            id: artistData.coverArt,
            size: "300",
          }),
          albums: [],
          singles: [],
        },
        cover: buildUrl("getCoverArt.view", params, {
          id: a.coverArt,
          size: "300",
        }),
        songs: [],
        songCount: a.songCount,
      })) || [];

  const artistInfoResponse = await fetch(
    buildUrl("getArtistInfo.view", params, { id: artistId }),
  );
  const artistInfoData = await artistInfoResponse.json();

  const bio =
    artistInfoData["subsonic-response"]?.artistInfo?.biography ||
    "No biography available.";

  const artist: Artist = {
    id: artistData.id,
    name: artistData.name,
    cover: buildUrl("getCoverArt.view", params, {
      id: artistData.coverArt,
      size: "300",
    }),
    albums,
    singles,
    biography: bio,
  };
  return artist;
};
//#endregion

export interface Album {
  id: string;
  title: string;
  artist: Artist;
  cover: string;
  songs: Song[];
  songCount?: number;
}

export interface Song {
  id: string;
  title: string;
  artist: Artist;
  album: Album;
  cover: string;
  duration: number;
  starred: boolean;
}
