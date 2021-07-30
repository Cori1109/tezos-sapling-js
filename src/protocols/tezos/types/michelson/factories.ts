import { UnsupportedError } from '../../../../errors'
import { Domain } from '../../../../errors/coinlib-error'
import { MichelsonList } from './generics/MichelsonList'
import { MichelsonOption } from './generics/MichelsonOption'
import { MichelsonOr } from './generics/MichelsonOr'
import { MichelsonPair } from './generics/MichelsonPair'
import { MichelsonGrammarType } from './grammar/MichelsonGrammarType'
import { MichelsonType } from './MichelsonType'
import { MichelsonAddress } from './primitives/MichelsonAddress'
import { MichelsonBool } from './primitives/MichelsonBool'
import { MichelsonBytes } from './primitives/MichelsonBytes'
import { MichelsonInt } from './primitives/MichelsonInt'
import { MichelsonString } from './primitives/MichelsonString'
import { MichelsonUnit } from './primitives/MichelsonUnit'

export const michelsonTypeFactories: Record<MichelsonGrammarType, (...args: unknown[]) => MichelsonType> = {
  nat: (...args: unknown[]): MichelsonType => MichelsonInt.from(args[0]),
  int: (...args: unknown[]): MichelsonType => MichelsonInt.from(args[0]),
  string: (...args: unknown[]): MichelsonType => MichelsonString.from(args[0]),
  bytes: (...args: unknown[]): MichelsonType => MichelsonBytes.from(args[0]),
  mutez: (): MichelsonType => notSupported('mutez'),
  bool: (...args: unknown[]): MichelsonType => MichelsonBool.from(args[0]),
  key_hash: (...args: unknown[]): MichelsonType => MichelsonString.from(args[0]),
  timestamp: (): MichelsonType => notSupported('timestamp'),
  address: (...args: unknown[]): MichelsonType => MichelsonAddress.from(args[0]),
  key: (): MichelsonType => notSupported('key'),
  unit: (...args: unknown[]): MichelsonType => MichelsonUnit.from(args[0]),
  signature: (): MichelsonType => notSupported('signature'),
  option: (...args: unknown[]): MichelsonType => MichelsonOption.from(args[0], args[1]),
  list: (...args: unknown[]): MichelsonType => MichelsonList.from(args[0], args[1]),
  set: (): MichelsonType => notSupported('set'),
  operation: (): MichelsonType => notSupported('operation'),
  contract: (...args: unknown[]): MichelsonType => MichelsonAddress.from(args[0]),
  pair: (...args: unknown[]): MichelsonType => MichelsonPair.from(args[0], undefined, ...args.splice(1)),
  or: (...args: unknown[]): MichelsonType => MichelsonOr.from(args[0], args[1], args[2]),
  lambda: (...args: unknown[]): MichelsonType => MichelsonString.from(args[0]),
  map: (): MichelsonType => notSupported('map'),
  big_map: (...args: unknown[]): MichelsonType => MichelsonInt.from(args[0]),
  chain_id: (): MichelsonType => notSupported('chain_id'),
  sapling_transaction: (...args: unknown[]): MichelsonType => MichelsonBytes.from(args[0])
}

function notSupported(type: MichelsonGrammarType): MichelsonType {
  throw new UnsupportedError(Domain.TEZOS, `Michelson type ${type} is not supported.`)
}
