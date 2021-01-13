import { CooleyTukey } from "./CooleyTukey";
import { DFTAlgorithm, List, TrigonometricTable } from "./types";
import { initTable } from "./internal/initTable";

export class Bluestein implements DFTAlgorithm {
  readonly size: number;
  readonly range: number;

  private invert: -1 | 1 = -1;
  private cooleyTukey: CooleyTukey;
  private table: TrigonometricTable;
  private Bfor: [Float64Array, Float64Array];
  private Binv: [Float64Array, Float64Array];

  constructor(size: number) {
    let range = 1;

    while (range < 2 * size - 1) {
      range *= 2;
    }

    this.size = size;
    this.range = range;
    this.cooleyTukey = new CooleyTukey(range);
    this.table = initTable(2 * size);

    this.Bfor = [new Float64Array(range), new Float64Array(range)];
    this.Binv = [new Float64Array(range), new Float64Array(range)];
    this.createBeta();
  }

  complexDFT<T extends List>(xr: T, xi: T): [T, T] {
    this.invert = -1;
    return this.bluestein(xr, xi);
  }

  complexIDFT<T extends List>(Xr: T, Xi: T): [T, T] {
    this.invert = 1;
    return this.bluestein(Xr, Xi);
  }

  realDFT<T extends List>(xr: T, tmpi: T): [T, T] {
    this.invert = -1;
    return this.bluestein(xr, tmpi, true);
  }

  realIDFT<T extends List>(Xr: T, Xi: T): T {
    this.invert = 1;
    const size = this.size;
    const half = (size >> 1) + 1;

    for (let i = 1; i < half; i++) {
      Xr[size - i] = Xr[i];
      Xi[size - i] = -Xi[i];
    }

    const x = this.bluestein(Xr, Xi);
    return x[0];
  }

  private bluestein<T extends List>(xr: T, xi: T, rdft = false): [T, T] {
    const { cos, sin } = this.table;
    const size = this.size;
    const range = this.range;
    const invert = this.invert;

    if (rdft) {
      for (let i = 0, m = 0; i < size; i++) {
        xi[i] = xr[i] * invert * sin[m];
        xr[i] = xr[i] * cos[m];
        m += 2 * i + 1;
        if (m > 2 * size - 1) m -= 2 * size;
      }
    } else {
      for (let i = 0, m = 0; i < size; i++) {
        const ar = xr[i];
        const ai = xi[i];
        const wr = cos[m];
        const wi = invert * sin[m];

        xr[i] = ar * wr - ai * wi;
        xi[i] = ar * wi + ai * wr;

        m += 2 * i + 1;
        if (m > 2 * size - 1) m -= 2 * size;
      }
    }

    for (let i = size; i < range; i++) {
      xr[i] = 0;
      xi[i] = 0;
    }

    const A = this.cooleyTukey.complexDFT(xr, xi);
    const B = invert === -1 ? this.Bfor : this.Binv;

    for (let i = 0; i < range; i++) {
      const Ar = A[0][i];
      const Ai = A[1][i];
      const Br = B[0][i];
      const Bi = B[1][i];

      A[0][i] = Ar * Br - Ai * Bi;
      A[1][i] = Ar * Bi + Ai * Br;
    }

    const X = this.cooleyTukey.complexIDFT(A[0], A[1]);

    for (let i = 0, m = 0; i < size; i++) {
      const Xr = X[0][i];
      const Xi = X[1][i];
      const br = cos[m];
      const bi = -invert * sin[m];

      X[0][i] = br * Xr + bi * Xi;
      X[1][i] = br * Xi - bi * Xr;

      m += 2 * i + 1;
      if (m > 2 * size - 1) m -= 2 * size;
    }

    if (invert === 1) {
      const ninv = 1 / size;

      for (let i = 0; i < size; i++) {
        X[0][i] *= ninv;
        X[1][i] *= ninv;
      }
    }

    return X;
  }

  private createBeta(): void {
    const { cos, sin } = this.table;
    const size = this.size;
    const range = this.range;
    const Bfor = this.Bfor;
    const Binv = this.Binv;

    Bfor[0][0] = 1;
    Bfor[1][0] = 0;
    Binv[0][0] = 1;
    Binv[1][0] = 0;

    for (let i = 1, m = 1; i < size; i++) {
      const wr = cos[m];
      const wi = sin[m];

      Bfor[0][i] = wr;
      Bfor[1][i] = wi;

      Binv[0][i] = wr;
      Binv[1][i] = -wi;

      Bfor[0][range - i] = wr;
      Bfor[1][range - i] = wi;

      Binv[0][range - i] = wr;
      Binv[1][range - i] = -wi;

      m += 2 * i + 1;
      if (m > 2 * size - 1) m -= 2 * size;
    }

    for (let i = size; i <= range - size; i++) {
      Bfor[0][i] = 0;
      Bfor[1][i] = 0;
      Binv[0][i] = 0;
      Binv[1][i] = 0;
    }

    this.cooleyTukey.complexDFT(Bfor[0], Bfor[1]);
    this.cooleyTukey.complexDFT(Binv[0], Binv[1]);
  }
}
