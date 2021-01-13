import { TrigonometricTable } from "../types";

export const initTable = (n: number): TrigonometricTable => {
  const cos = new Float64Array(n);
  const sin = new Float64Array(n);
  const table: TrigonometricTable = { cos, sin };

  for (let i = 0; i < n; i++) {
    cos[i] = Math.cos(2 * Math.PI * (i / n));
    sin[i] = Math.sin(2 * Math.PI * (i / n));
  }

  return table;
};
