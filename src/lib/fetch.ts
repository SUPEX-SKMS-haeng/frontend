import qs from "qs";
import {
  clearLocalStorageAuthData,
  toCamelCase,
  toSnakeCase,
  transformKeys,
} from "@/utils/utils";

const { fetch: originalFetch } = window;
window.fetch = async (...args) => {
  const [resource, config] = args;
  const headers: Record<string, string> = {
    ...(config?.headers as Record<string, string>),
  };

  const token = localStorage.getItem("token");
  if (token && !headers.Authorization) {
    headers.Authorization = `Bearer ${token}`;
  }

  const response = await originalFetch(resource, { ...config, headers });

  if (response.status === 401) {
    clearLocalStorageAuthData();
    window.location.href = import.meta.env.VITE_LOGIN_URL ?? "/login";
  }

  return response;
};

interface FetchInstanceOptions extends Omit<RequestInit, "body"> {
  body?: Record<string, unknown>;
  params?: Record<string, unknown>;
}

const getBaseURL = () => import.meta.env.VITE_API_BASE_URL ?? "/api";

const fetchInstance = async <T = unknown>(
  path: string,
  options: FetchInstanceOptions = {}
): Promise<T> => {
  const { body, params, headers, ...rest } = options;

  let url = `${getBaseURL()}${path}`;
  if (params) {
    const serialized = qs.stringify(
      transformKeys(params, toSnakeCase) as Record<string, unknown>,
      { arrayFormat: "brackets" }
    );
    url += `?${serialized}`;
  }

  const res = await window.fetch(url, {
    ...rest,
    headers: {
      "Content-Type": "application/json",
      ...(headers as Record<string, string>),
    },
    body: body ? JSON.stringify(transformKeys(body, toSnakeCase)) : undefined,
  });

  if (!res.ok) {
    throw new Error(`HTTP error: ${res.status}`);
  }

  const data: unknown = await res.json();
  return transformKeys(data, toCamelCase) as T;
};

export default fetchInstance;
