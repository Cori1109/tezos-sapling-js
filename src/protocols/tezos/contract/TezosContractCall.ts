import BigNumber from "bignumber.js"
import { MichelsonType } from "../types/michelson/MichelsonType"
import { TezosTransactionParameters } from "../types/operations/Transaction"

export class TezosContractCall {
  constructor(
    readonly entrypoint: string,
    readonly michelsonValue: MichelsonType | undefined,
    readonly amount?: BigNumber
  ) {}

  public args(): any | undefined {
    return this.michelsonValue?.asRawValue()
  }

  public toJSON(): TezosTransactionParameters {
    return {
      entrypoint: this.entrypoint,
      value: this.michelsonValue ? this.michelsonValue.toMichelineJSON() : [],
    }
  }
}
