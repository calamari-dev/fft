import { initTable } from "./internal/initTable";
import { DFTAlgorithm, List, TrigonometricTable } from "./types";

export class CooleyTukey implements DFTAlgorithm {
  readonly size: number;
  readonly range: number;

  private invert: 1 | -1 = -1;
  private real = false;
  private table: TrigonometricTable;

  constructor(size: number) {
    this.size = size;
    this.range = size;
    this.table = initTable(size);
  }

  complexDFT<T extends List>(xr: T, xi: T): [T, T] {
    this.invert = -1;
    this.real = false;
    return this.cooleyTukey(xr, xi);
  }

  complexIDFT<T extends List>(Xr: T, Xi: T): [T, T] {
    this.invert = 1;
    this.real = false;
    return this.cooleyTukey(Xr, Xi);
  }

  realDFT<T extends List>(xr: T, tmpi: T): [T, T] {
    this.invert = -1;
    this.real = true;
    const half = this.size >> 1;

    for (let k = 0; k < half; k++) {
      xr[k] = xr[2 * k];
      tmpi[k] = xr[2 * k + 1];
    }

    const X = this.cooleyTukey(xr, tmpi);
    this.arrange(X[0], X[1]);
    return X;
  }

  realIDFT<T extends List>(Xr: T, Xi: T): T {
    this.invert = 1;
    this.real = true;

    this.arrange(Xr, Xi);
    const y = this.cooleyTukey(Xr, Xi);

    const end = this.size - 1;
    const half = (this.size >> 1) - 1;

    for (let k = 0; k <= half; k++) {
      y[0][end - 2 * k - 1] = y[0][half - k];
      y[0][end - 2 * k] = y[1][half - k];
    }

    return y[0];
  }

  private arrange<T extends List>(Xr: T, Xi: T) {
    const { cos, sin } = this.table;
    const invert = this.invert;
    const half = this.size >> 1;
    const quarter = this.size >> 2;

    if (invert === -1) {
      const tmpr = Xr[0];
      const tmpi = Xi[0];
      Xr[0] = tmpr + tmpi;
      Xi[0] = 0;
      Xi[quarter] *= -1;
      Xr[half] = tmpr - tmpi;
      Xi[half] = 0;
    } else {
      const tmpr = Xr[0];
      Xr[0] = 0.5 * (tmpr + Xr[half]);
      Xi[0] = 0.5 * (tmpr - Xr[half]);
      Xi[quarter] *= -1;
    }

    for (let k = 1; k < quarter; k++) {
      const Ar = Xr[k];
      const Ai = Xi[k];
      const Br = Xr[half - k];
      const Bi = Xi[half - k];

      const wr = 1 + sin[k];
      const wi = -invert * cos[k];

      const tmpr = 0.5 * ((Ar - Br) * wr - (Ai + Bi) * wi);
      const tmpi = 0.5 * ((Ar - Br) * wi + (Ai + Bi) * wr);

      Xr[k] = Ar - tmpr;
      Xi[k] = Ai - tmpi;
      Xr[half - k] = Br + tmpr;
      Xi[half - k] = Bi - tmpi;
    }
  }

  private bitReverse<T extends List>(xr: T, xi: T, size: number) {
    for (let i = 1, irev = 0; i < size - 1; i++) {
      for (let pow = size >> 1; ; pow >>= 1) {
        if (!(irev & pow)) {
          irev ^= pow;
          break;
        }

        irev ^= pow;
      }

      if (i < irev) {
        const tmpr = xr[i];
        const tmpi = xi[i];
        xr[i] = xr[irev];
        xi[i] = xi[irev];
        xr[irev] = tmpr;
        xi[irev] = tmpi;
      }
    }
  }

  private cooleyTukey<T extends List>(xr: T, xi: T): [T, T] {
    const { cos, sin } = this.table;
    const invert = this.invert;
    let size = this.size;
    let w = 1;

    if (this.real) {
      size >>= 1;
      w = 2;
    }

    for (let n = size, nh = size; n > 1; n = nh) {
      nh >>= 1;

      for (let L = 0; L < size; L += n) {
        for (let k = L; k < L + nh; k++) {
          const wr = cos[w * (k - L)];
          const wi = invert * sin[w * (k - L)];
          const zr = xr[k] - xr[k + nh];
          const zi = xi[k] - xi[k + nh];

          xr[k] = xr[k] + xr[k + nh];
          xi[k] = xi[k] + xi[k + nh];
          xr[k + nh] = wr * zr - wi * zi;
          xi[k + nh] = wr * zi + wi * zr;
        }
      }

      w *= 2;
    }

    this.bitReverse(xr, xi, size);

    if (invert === 1) {
      const ninv = 1 / size;

      for (let i = 0; i < size; i++) {
        xr[i] *= ninv;
        xi[i] *= ninv;
      }
    }

    return [xr, xi];
  }
}
