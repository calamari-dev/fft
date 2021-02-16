import "jest";
import DFT from "../src";

const bruteForceDFT = (x: [ArrayLike<number>, ArrayLike<number>]) => {
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

(["Cooley-Tukey", "Bluestein"] as const).forEach((fftType) => {
  const size = fftType === "Cooley-Tukey" ? 64 : 60;
  const range = fftType === "Cooley-Tukey" ? 64 : 128;

  describe(fftType, () => {
    (["Array", "Float32Array", "Float64Array"] as const).forEach((vecType) => {
      it(`Real ${vecType}`, () => {
        const fft = new DFT(size);
        const xr = fft.createVec(vecType);
        const xi = fft.createVec(vecType);

        expect(fft.size).toBe(size);
        expect(fft.range).toBe(range);

        for (let t = 0; t < size; t++) {
          xr[t] = Math.random();
          xi[t] = 0;
        }

        const _xr = xr.slice(0);
        const [Tr, Ti] = bruteForceDFT([xr, xi]);
        const [Xr, Xi] = fft.realDFT(xr);

        expect(Xr.length).toBe((size >> 1) + 1);

        for (let f = 0; f < Xr.length; f++) {
          expect(Xr[f]).toBeCloseTo(Tr[f], 3);
          expect(Xi[f]).toBeCloseTo(Ti[f], 3);
        }

        const y = fft.realIDFT(Tr, Ti);
        expect(y.length).toBe(size);

        for (let t = 0; t < size; t++) {
          expect(y[t]).toBeCloseTo(_xr[t], 3);
        }
      });

      it(`Complex ${vecType}`, () => {
        const fft = new DFT(size);
        const xr = fft.createVec(vecType);
        const xi = fft.createVec(vecType);

        expect(fft.size).toBe(size);
        expect(fft.range).toBe(range);

        for (let t = 0; t < size; t++) {
          xr[t] = Math.random();
          xi[t] = Math.random();
        }

        const _xr = xr.slice(0);
        const _xi = xi.slice(0);
        const [Tr, Ti] = bruteForceDFT([xr, xi]);
        const [Xr, Xi] = fft.complexDFT(xr, xi);

        expect(Xr.length).toBe(size);
        expect(Xi.length).toBe(size);

        for (let f = 0; f < size; f++) {
          expect(Xr[f]).toBeCloseTo(Tr[f], 3);
          expect(Xi[f]).toBeCloseTo(Ti[f], 3);
        }

        const [yr, yi] = fft.complexIDFT(Tr, Ti);
        expect(yr.length).toBe(size);
        expect(yi.length).toBe(size);

        for (let t = 0; t < size; t++) {
          expect(yr[t]).toBeCloseTo(_xr[t], 3);
          expect(yi[t]).toBeCloseTo(_xi[t], 3);
        }
      });
    });
  });
});
