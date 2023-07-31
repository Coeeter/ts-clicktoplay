type ExtractParams<T> = {
  [K in keyof T]: T[K] extends string ? string : never;
};

export const extractSearchParams = <T>(url: string): ExtractParams<T> => {
  const searchParams = new URL(url).searchParams;
  const params: Partial<ExtractParams<T>> = {};
  searchParams.forEach((value, key) => {
    if (value === null) return;
    params[key as keyof T] = value as ExtractParams<T>[keyof T];
  });
  return params as ExtractParams<T>;
};
