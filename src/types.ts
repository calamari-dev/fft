export type TypedArray = Float32Array | Float64Array;

export type ListType = "Float32Array" | "Float64Array" | "Array";

export type List<T extends ListType = ListType> = T extends "Float32Array"
  ? Float32Array
  : T extends "Float64Array"
  ? Float64Array
  : number[];

export interface TrigonometricTable {
  readonly cos: Float64Array;
  readonly sin: Float64Array;
}

export interface DFTAlgorithm {
  readonly size: number;
  readonly range: number;
  complexDFT<T extends List>(xr: T, xi: T): [T, T];
  complexIDFT<T extends List>(Xr: T, Xi: T): [T, T];
  realDFT<T extends List>(xr: T, tmpi: T): [T, T];
  realIDFT<T extends List>(Xr: T, Xi: T): T;
}
