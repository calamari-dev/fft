import { List, TypedArray } from "../types";

export const isTypedArray = (x: List): x is TypedArray => {
  return !Array.isArray(x);
};
