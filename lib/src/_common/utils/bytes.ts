// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
export const toHexString = (bytes) =>
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  bytes.reduce((str, byte) => str + byte.toString(16).padStart(2, "0"), "");

// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
export const fromHexString = (hexString) =>
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  Uint8Array.from(hexString.match(/.{1,2}/g).map((byte) => parseInt(byte, 16)));
