import { Bluestein } from "./Bluestein";
import { CooleyTukey } from "./CooleyTukey";
import { createListFromConstructor } from "./list/createListFromConstructor";
import { createListFromListType } from "./list/createListFromListType";
import { expand } from "./list/expand";
import { shrink } from "./list/shrink";
import { DFTAlgorithm, ListType, List } from "./types";

export class DFT implements DFTAlgorithm {
  readonly size: number;
  readonly range: number;
  private algorithm: DFTAlgorithm;

  constructor(size: number) {
    const algorithm = this.decideAlgorithm(size);
    this.size = size;
    this.range = algorithm.range;
    this.algorithm = algorithm;
  }

  private decideAlgorithm(size: number) {
    return !(size & (size - 1)) ? new CooleyTukey(size) : new Bluestein(size);
  }

  createVec<T extends ListType>(type: T): List<T> {
    return createListFromListType(type, this.size, this.range);
  }

  complexDFT<T extends List>(xr: T, xi: T): [T, T] {
    const size = this.size;
    const range = this.range;
    xr = expand(xr, range);
    xi = expand(xi, range);

    const X = this.algorithm.complexDFT(xr, xi);
    X[0] = shrink(X[0], size);
    X[1] = shrink(X[1], size);
    return X;
  }

  complexIDFT<T extends List>(Xr: T, Xi: T): [T, T] {
    const size = this.size;
    const range = this.range;
    Xr = expand(Xr, range);
    Xi = expand(Xi, range);

    const x = this.algorithm.complexIDFT(Xr, Xi);
    x[0] = shrink(x[0], size);
    x[1] = shrink(x[1], size);
    return x;
  }

  realDFT<T extends List>(xr: T): [T, T] {
    const range = this.range;
    const half = this.size >> 1;
    const tmpi = createListFromConstructor(xr, range);
    xr = expand(xr, range);

    const X = this.algorithm.realDFT(xr, tmpi);
    X[0] = shrink(X[0], half + 1);
    X[1] = shrink(X[1], half + 1);
    return X;
  }

  realIDFT<T extends List>(Xr: T, Xi: T): T {
    const range = this.range;
    Xr = expand(Xr, range);
    Xi = expand(Xi, range);

    const x = this.algorithm.realIDFT(Xr, Xi);
    return shrink(x, this.size);
  }
}
