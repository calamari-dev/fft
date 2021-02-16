# fft

This is an implementation of FFT in an arbitrary length. This consists of Cooley-Tukey FFT (used if the size is the power of 2) and Bluestein FFT (used as a fallback).

## Examples

### Complex DFT/IDFT

```typescript
import DFT from "fft";

const size = 1000;
const dft = new DFT(size);
const xr = dft.createVec("Float64Array"); // Float32Array and Array are also OK.
const xi = dft.createVec("Float64Array"); // The instance of xr and xi must be the same.

for (let t = 0; t < 1000; t++) {
  xr[t] = Math.random();
  xi[t] = Math.random();
}

const [Xr, Xi] = dft.complexDFT(xr, xi); // xr and xi are changed, even though Xr !== xr && Xi !== xi (please see Note).

// some manipulations

const [yr, yi] = dft.complexIDFT(Xr, Xi);

```

### Real DFT/IDFT

```typescript
import DFT from "fft";

const size = 1000;
const dft = new DFT(size);
const x = dft.createVec("Float64Array");

for (let t = 0; t < 1000; t++) {
  x[t] = Math.random();
}

const [Xr, Xi] = dft.realDFT(x); // xr is changed, even though Xr !== xr (please see Note).

// Xr.length === Math.floor(size / 2) + 1
// some manipulations

const y = dft.realIDFT(Xr, Xi);

```

### I want to know more

Please see [test](https://github.com/calamari-dev/fft/blob/main/__tests__/index.ts).

## Note

In this section, "equal" means `===`.

+ Arguments are equal to returned values if and only if `Array.isArray(argument)`.
+ Note that DFT/IDFT changes its arguments, even though sometimes arguments are not equal to returned values. It is because returned value's [`ArrayBuffer`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/ArrayBuffer) is shared with arguments. In other words, **DFT/IDFT is always in-place.**

