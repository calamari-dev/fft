import { List } from "../types";

export const shrink = <T extends List>(x: T, size: number): T => {
  if (x instanceof Float32Array || x instanceof Float64Array) {
    return x.subarray(0, size) as T;
  }

  (x as number[]).length = size;
  return x;
};
