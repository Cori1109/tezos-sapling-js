import BigNumber from "bignumber.js"

import { TezosSaplingCiphertext } from "./TezosSaplingCiphertext"

export interface TezosSaplingSpendDescription {
  cv: Buffer
  nf: Buffer
  rk: Buffer
  proof: Buffer
  signature: Buffer
}

export interface TezosSaplingOutputDescription {
  cm: Buffer
  proof: Buffer
  ciphertext: TezosSaplingCiphertext
}

export interface TezosSaplingTransaction {
  spendDescriptions: TezosSaplingSpendDescription[]
  outputDescriptions: TezosSaplingOutputDescription[]
  bindingSignature: Buffer
  balance: BigNumber
  root: string
}
