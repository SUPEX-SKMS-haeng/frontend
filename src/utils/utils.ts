export const toCamelCase = (str: string): string =>
  str.replace(/_([a-z])/g, (_, c: string) => c.toUpperCase());

export const toSnakeCase = (str: string): string =>
  str.replace(/[A-Z]/g, (c) => `_${c.toLowerCase()}`);

export const transformKeys = (
  data: unknown,
  converter: (key: string) => string
): unknown => {
  if (Array.isArray(data)) {
    return data.map((item) => transformKeys(item, converter));
  }
  if (data !== null && typeof data === "object" && !(data instanceof Date)) {
    return Object.entries(data as Record<string, unknown>).reduce(
      (acc, [key, value]) => {
        acc[converter(key)] = transformKeys(value, converter);
        return acc;
      },
      {} as Record<string, unknown>
    );
  }
  return data;
};

export const clearLocalStorageAuthData = (): void => {
  localStorage.removeItem("token");
};
