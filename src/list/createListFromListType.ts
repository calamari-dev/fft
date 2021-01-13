import { ListType, List } from "../types";

export const createListFromListType = <T extends ListType>(
  type: T,
  size: number,
  range: number
): List<T> => {
  let vec: unknown;

  switch (type) {
    case "Float32Array": {
      const buffer = new ArrayBuffer(range * 4);
      vec = new Float32Array(buffer, 0, size);
      break;
    }
    case "Float64Array": {
      const buffer = new ArrayBuffer(range * 8);
      vec = new Float64Array(buffer, 0, size);
      break;
    }
    case "Array": {
      const tmp = new Array<number>();
      vec = tmp;
      break;
    }
  }

  return vec as List<T>;
};
