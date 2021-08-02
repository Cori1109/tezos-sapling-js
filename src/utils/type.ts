import BigNumber from "bignumber.js"

export function isRecord(obj: unknown): obj is Record<string, any> {
  return (
    obj instanceof Object &&
    !Array.isArray(obj) &&
    !Buffer.isBuffer(obj) &&
    !BigNumber.isBigNumber(obj) &&
    Object.values(obj).every((value) => typeof value !== "function")
  )
}
