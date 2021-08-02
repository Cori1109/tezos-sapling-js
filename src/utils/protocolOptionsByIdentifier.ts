import { NotFoundError } from "../errors"
import { Domain } from "../errors/coinlib-error"

import {
  TezosBTCProtocolConfig,
  TezosETHtzProtocolConfig,
  TezosFAProtocolOptions,
  TezosKolibriUSDProtocolConfig,
  TezosStakerProtocolConfig,
  TezosUSDProtocolConfig,
  TezosUUSDProtocolConfig,
  TezosWrappedProtocolConfig,
  TezosYOUProtocolConfig,
} from "../protocols/tezos/fa/TezosFAProtocolOptions"
import {
  TezosSaplingProtocolOptions,
  TezosShieldedTezProtocolConfig,
} from "../protocols/tezos/sapling/TezosSaplingProtocolOptions"
import {
  TezosProtocolNetwork,
  TezosProtocolOptions,
} from "../protocols/tezos/TezosProtocolOptions"

import { assertNever } from "./assert"
import { NetworkType, ProtocolNetwork } from "./ProtocolNetwork"
import { ProtocolOptions } from "./ProtocolOptions"
import {
  MainProtocolSymbols,
  ProtocolSymbols,
  SubProtocolSymbols,
} from "./ProtocolSymbols"

// tslint:disable:cyclomatic-complexity
const getProtocolOptionsByIdentifier: (
  identifier: ProtocolSymbols,
  network?: ProtocolNetwork
) => ProtocolOptions = (
  identifier: ProtocolSymbols,
  network?: ProtocolNetwork
): ProtocolOptions => {
  switch (identifier) {
    case MainProtocolSymbols.XTZ:
    case SubProtocolSymbols.XTZ_KT:
      return new TezosProtocolOptions(
        network ? (network as TezosProtocolNetwork) : new TezosProtocolNetwork()
      )
    case MainProtocolSymbols.XTZ_SHIELDED:
      return new TezosSaplingProtocolOptions(
        network
          ? (network as TezosProtocolNetwork)
          : new TezosProtocolNetwork(
              "Florencenet",
              NetworkType.TESTNET,
              "https://tezos-florencenet-node.prod.gke.papers.tech"
            ),
        new TezosShieldedTezProtocolConfig()
      )
    case SubProtocolSymbols.XTZ_BTC:
      return new TezosFAProtocolOptions(
        network
          ? (network as TezosProtocolNetwork)
          : new TezosProtocolNetwork(),
        new TezosBTCProtocolConfig()
      )
    case SubProtocolSymbols.XTZ_ETHTZ:
      return new TezosFAProtocolOptions(
        network
          ? (network as TezosProtocolNetwork)
          : new TezosProtocolNetwork(),
        new TezosETHtzProtocolConfig()
      )
    case SubProtocolSymbols.XTZ_UUSD:
      return new TezosFAProtocolOptions(
        network
          ? (network as TezosProtocolNetwork)
          : new TezosProtocolNetwork(),
        new TezosUUSDProtocolConfig()
      )
    case SubProtocolSymbols.XTZ_YOU:
      return new TezosFAProtocolOptions(
        network
          ? (network as TezosProtocolNetwork)
          : new TezosProtocolNetwork(),
        new TezosYOUProtocolConfig()
      )
    case SubProtocolSymbols.XTZ_W:
      return new TezosFAProtocolOptions(
        network
          ? (network as TezosProtocolNetwork)
          : new TezosProtocolNetwork(),
        new TezosWrappedProtocolConfig()
      )
    case SubProtocolSymbols.XTZ_KUSD:
      return new TezosFAProtocolOptions(
        network
          ? (network as TezosProtocolNetwork)
          : new TezosProtocolNetwork(),
        new TezosKolibriUSDProtocolConfig()
      )
    case SubProtocolSymbols.XTZ_USD:
      return new TezosFAProtocolOptions(
        network
          ? (network as TezosProtocolNetwork)
          : new TezosProtocolNetwork(),
        new TezosUSDProtocolConfig()
      )
    case SubProtocolSymbols.XTZ_STKR:
      return new TezosFAProtocolOptions(
        network
          ? (network as TezosProtocolNetwork)
          : new TezosProtocolNetwork(),
        new TezosStakerProtocolConfig()
      )

    default:
      // Maybe we get an identifier of a sub-protocol that is not in the known list. In that case, get the options of the parent
      if ((identifier as string).includes("-")) {
        return getProtocolOptionsByIdentifier(
          (identifier as string).split("-")[0] as any
        )
      }
      // assertNever(identifier)
      throw new NotFoundError(
        Domain.UTILS,
        `No protocol options found for ${identifier}`
      )
  }
}

export { getProtocolOptionsByIdentifier }
