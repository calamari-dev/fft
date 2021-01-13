import "jest";
import DFT from "../src";

const dft = (x: [ArrayLike<number>, ArrayLike<number>]) => {
  const size = x[0].length;
  const X: [number[], number[]] = [[], []];

  for (let k = 0; k < size; k++) {
    let [sumr, sumi] = [0, 0];

    for (let i = 0; i < size; i++) {
      const arg = (2 * Math.PI * k * i) / size;
      const [wr, wi] = [Math.cos(arg), -Math.sin(arg)];
      const [zr, zi] = [x[0][i], x[1][i]];
      sumr += wr * zr - wi * zi;
      sumi += wr * zi + wi * zr;
    }

    [X[0][k], X[1][k]] = [sumr, sumi];
  }

  return X;
};

const createNumericEqual = (eps: number) => {
  return (x: ArrayLike<number>, y: ArrayLike<number>) => {
    if (x.length !== y.length) {
      return false;
    }

    return Array.from(x).every((x, i) => {
      if (Math.abs(x) < eps && Math.abs(y[i]) < eps) {
        return true;
      } else if (y[i] === 0) {
        return Math.abs(x) < eps;
      } else {
        return Math.abs(x / y[i] - 1) < eps;
      }
    });
  };
};

const fftTester = (
  size: number,
  mode: "real" | "complex",
  type: "Array" | "Float32Array" | "Float64Array"
) => {
  const fft = new DFT(size);
  const xr = fft.createVec(type);
  const xi = fft.createVec(type);
  const eps = type === "Float32Array" ? 1e-3 : 1e-6;
  const isNumericEqual = createNumericEqual(eps);

  if (mode === "real") {
    for (let i = 0; i < fft.size; i++) {
      xr[i] = Math.random();
      xi[i] = 0;
    }

    const xrCopy = xr.slice(0);

    const [Xr, Xi] = dft([xr, xi]);
    const [Yr, Yi] = fft.realDFT(xr);

    Xr.length = (size >> 1) + 1;
    Xi.length = (size >> 1) + 1;

    expect(isNumericEqual(Xr, Yr)).toBe(true);
    expect(isNumericEqual(Xi, Yi)).toBe(true);

    const y = fft.realIDFT(Xr, Xi);
    expect(isNumericEqual(xrCopy, y)).toBe(true);
  } else {
    for (let i = 0; i < fft.size; i++) {
      xr[i] = Math.random();
      xi[i] = Math.random();
    }

    const xrCopy = xr.slice(0);
    const xiCopy = xi.slice(0);

    const [Xr, Xi] = dft([xr, xi]);
    const [Yr, Yi] = fft.complexDFT(xr, xi);

    expect(isNumericEqual(Xr, Yr)).toBe(true);
    expect(isNumericEqual(Xi, Yi)).toBe(true);

    const [yr, yi] = fft.complexIDFT(Xr, Xi);
    expect(isNumericEqual(yr, xrCopy)).toBe(true);
    expect(isNumericEqual(yi, xiCopy)).toBe(true);
  }
};

for (const x1 of ["real", "complex"] as const) {
  for (const x2 of ["Array", "Float32Array", "Float64Array"] as const) {
    test(`${x1} ${x2} Cooley-Tukey`, () => {
      fftTester(64, x1, x2);
    });
  }
}

for (const x1 of ["real", "complex"] as const) {
  for (const x2 of ["Array", "Float32Array", "Float64Array"] as const) {
    test(`${x1} ${x2} Bluestein`, () => {
      fftTester(65, x1, x2);
    });
  }
}
