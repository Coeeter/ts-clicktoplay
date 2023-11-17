export type CamelCase<S extends string> =
  S extends `${infer FirstWord}_${infer SecondWord}${infer Rest}`
    ? `${Lowercase<FirstWord>}${Uppercase<SecondWord>}${CamelCase<Rest>}`
    : Lowercase<S>;

export type KeysToCamelCase<T> = {
  [K in keyof T as CamelCase<string & K>]: T[K] extends {}
    ? KeysToCamelCase<T[K]>
    : T[K];
};

export const camelCase = (str: string) =>
  str.toLowerCase().replace(/_([a-z])/g, (_, p1) => p1.toUpperCase());

export const keysToCamelCase = <T extends {}>(obj: T): KeysToCamelCase<T> => {
  if (obj === null || obj === undefined) return obj as any;
  if (typeof obj !== 'object') return obj as any;
  if (Array.isArray(obj)) return obj.map(keysToCamelCase) as KeysToCamelCase<T>;
  return Object.fromEntries(
    Object.entries(obj).map(([key, val]) => [
      camelCase(key),
      val !== null && typeof val === 'object' ? keysToCamelCase(val) : val,
    ])
  ) as KeysToCamelCase<T>;
};
