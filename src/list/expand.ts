import { List } from "../types";

export const expand = <T extends List>(x: T, range: number): T => {
  if (x instanceof Float32Array) {
    return new Float32Array(x.buffer, 0, range) as T;
  }

  if (x instanceof Float64Array) {
    return new Float64Array(x.buffer, 0, range) as T;
  }

  return x as T;
};
