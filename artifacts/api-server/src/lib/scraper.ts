import axios from "axios";

const BASE_URL = "https://www.sankavollerei.com/anime/winbu";

const httpClient = axios.create({
  baseURL: BASE_URL,
  timeout: 15000,
  headers: {
    "User-Agent":
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
    "Accept": "application/json, text/html, */*;q=0.8",
    "Accept-Language": "id-ID,id;q=0.9,en-US;q=0.8,en;q=0.7",
    "Referer": "https://www.sankavollerei.com/",
  },
});

export async function proxyGet(path: string): Promise<unknown> {
  const { data } = await httpClient.get(path);
  return data;
}

export async function proxyGetWithQuery(
  path: string,
  query: Record<string, string | number | undefined>
): Promise<unknown> {
  const params = new URLSearchParams();
  for (const [k, v] of Object.entries(query)) {
    if (v !== undefined && v !== "") {
      params.set(k, String(v));
    }
  }
  const qs = params.toString();
  const url = qs ? `${path}?${qs}` : path;
  const { data } = await httpClient.get(url);
  return data;
}
