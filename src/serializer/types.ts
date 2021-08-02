import { TezosSaplingInput } from "../protocols/tezos/types/sapling/TezosSaplingInput"
import { TezosSaplingOutput } from "../protocols/tezos/types/sapling/TezosSaplingOutput"
import { TezosSaplingStateDiff } from "../protocols/tezos/types/sapling/TezosSaplingStateDiff"

import { UnsignedTransaction } from "./schemas/definitions/unsigned-transaction"

export interface RawTezosTransaction {
  binaryTransaction: string
}

export interface RawTezosSaplingTransaction {
  ins: TezosSaplingInput[]
  outs: TezosSaplingOutput[]
  chainId: string
  stateDiff: TezosSaplingStateDiff
  callParameters: string
}

export interface IInTransaction {
  txId: string
  value: string
  vout: number
  address: string
  derivationPath?: string
}

export interface IOutTransaction {
  recipient: string
  isChange: boolean
  value: string
  derivationPath?: string
}
