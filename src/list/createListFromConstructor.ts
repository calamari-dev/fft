import { List } from "../types";
import { createListFromListType } from "./createListFromListType";
import { isTypedArray } from "./isTypedArray";

export const createListFromConstructor = <T extends List>(
  x: T,
  size: number
): T => {
  const range = isTypedArray(x) ? x.buffer.byteLength / x.BYTES_PER_ELEMENT : 0;

  switch (x.constructor) {
    case Float32Array:
      return createListFromListType("Float32Array", size, range) as T;
    case Float64Array:
      return createListFromListType("Float64Array", size, range) as T;
    default:
      return createListFromListType("Array", size, size) as T;
  }
};
