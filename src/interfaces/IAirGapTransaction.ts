import { ProtocolNetwork } from "../utils/ProtocolNetwork"
import { ProtocolSymbols } from "../utils/ProtocolSymbols"

import { TezosTransactionCursor } from "./../protocols/tezos/types/TezosTransactionCursor"
import { TezosSaplingTransactionCursor } from "./../protocols/tezos/types/sapling/TezosSaplingTransactionCursor"

export enum AirGapTransactionType {
  SPEND = "Spend Transaction",
  DELEGATE = "Delegation",
  UNDELEGATE = "Undelegate",
}

export enum AirGapTransactionStatus {
  APPLIED = "applied",
  FAILED = "failed",
}

export interface IAirGapTransaction {
  from: string[]
  to: string[]
  isInbound: boolean
  amount: string
  fee: string
  timestamp?: number

  protocolIdentifier: ProtocolSymbols

  network: ProtocolNetwork

  hash?: string
  blockHeight?: string
  data?: string

  extra?: any
  status?: AirGapTransactionStatus

  transactionDetails?: any
}

export type IProtocolTransactionCursor =
  | TezosTransactionCursor
  | TezosSaplingTransactionCursor

export interface IAirGapTransactionResult {
  transactions: IAirGapTransaction[]
  cursor: IProtocolTransactionCursor
}
