// @ts-ignore
export const toHexString = (bytes) =>
  // @ts-ignore
  bytes.reduce((str, byte) => str + byte.toString(16).padStart(2, "0"), "");

// @ts-ignore
export const fromHexString = (hexString) =>
  // @ts-ignore
  Uint8Array.from(hexString.match(/.{1,2}/g).map((byte) => parseInt(byte, 16)));
