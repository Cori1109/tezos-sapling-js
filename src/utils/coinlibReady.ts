import * as sodium from "libsodium-wrappers"

const isCoinlibReady: () => Promise<void> = (): Promise<void> => {
  return sodium.ready
}

export { isCoinlibReady }
