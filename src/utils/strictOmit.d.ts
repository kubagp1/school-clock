/* eslint-disable @typescript-eslint/ban-types */

export {};

declare global {
  export type StrictOmit<T extends {}, K extends keyof T> = Pick<
    T,
    Exclude<keyof T, K>
  >;
}
