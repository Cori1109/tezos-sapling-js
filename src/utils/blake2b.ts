//@ts-ignore
import blake2b from "blake2b"

import { addHexPrefix, hexToBytes } from './hex'

export function blake2bAsHex(
  data: Uint8Array | string,
  bitLength: number,
  config: { withPrefix: boolean; key?: Uint8Array } = { withPrefix: false }
): string {
  const hash = blake2bAsBytes(data, bitLength, { key: config.key })
  const hex = Buffer.from(hash).toString('hex')

  return config.withPrefix ? addHexPrefix(hex) : hex
}

export function blake2bAsBytes(data: Uint8Array | string, bitLength: number, config: { key?: Uint8Array } = {}): Uint8Array {
  const byteLength = Math.ceil(bitLength / 8)
  const hashU8a = new Uint8Array(byteLength)

  const hash = blake2b(byteLength, config.key)
  hash.update(hexToBytes(data))
  hash.digest(hashU8a)

  return hashU8a
}
