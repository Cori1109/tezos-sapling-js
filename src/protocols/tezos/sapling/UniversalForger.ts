import BigNumber from "../../../dependencies/src/bignumber.js-9.0.0/bignumber"

import { TezosAddress } from "../TezosAddress"
import { TezosSaplingAddress } from "./TezosSaplingAddress"
import { TezosSaplingStateDiff } from "../types/sapling/TezosSaplingStateDiff"
import { TezosSaplingOutput } from "../types/sapling/TezosSaplingOutput"
import { TezosSaplingStateTree } from "../types/sapling/TezosSaplingStateTree"
import { TezosSaplingEncoder } from "./utils/TezosSaplingEncoder"
import { TezosSaplingForger } from "./utils/TezosSaplingForger"
import { TezosSaplingState } from "./utils/TezosSaplingState"
import { TezosSaplingCryptoClient } from "./TezosSaplingCryptoClient"
import { TezosCryptoClient } from "../TezosCryptoClient"
import { TezosSaplingTransaction } from "../types/sapling/TezosSaplingTransaction"
import { TezosSaplingBookkeeper } from "./utils/TezosSaplingBookkeeper"
import { MainProtocolSymbols } from "../../../utils/ProtocolSymbols"
import { TezosProtocolNetwork } from "../TezosProtocolOptions"
import {
  RawTezosSaplingTransaction,
  RawTezosTransaction,
} from "../../../serializer/types"
import { TezosContractCall } from "../contract/TezosContractCall"
import { TezosSaplingCiphertext } from "../types/sapling/TezosSaplingCiphertext"
import { TezosSaplingInput } from "../types/sapling/TezosSaplingInput"

import { NetworkType } from "../../../utils/ProtocolNetwork"

import { SaplingWasmService } from "./SaplingWasmMethodProvider"
import { getOrFetchParameters } from "./utils/SaplingParamsDownloader"

import { spawnSync } from "child_process"

import { TezosSaplingProtocol } from "./TezosSaplingProtocol"

const MERKLE_TREE_HEIGHT = 32
const MEMO_SIZE = 8
const CONTRACT_ADDRESS = "KT1Xtu1jKLrDhJytEfdwKEQapth4NuRGJmeK"
const CHAIN_ID = "NetXynUjJNZm7wi" // suitable for mockup client

const JULIAN_VIEWING_KEY =
  "0000000000000000004e836dac37234f08916ee886c8a6834816a0520b3d666bd4edf42130f826cae2379a26861252d22605e041b3ec6e19449a23863bce9ff20b78615a58446f7106f31f7a3d0efed751de9585116f73dbab76955d9b4d4378ed256792d57dce70e3cbbfaef401b0736255d060619f357c81c17074e1007d448bae942a19d33836da047bf52a95387da1b811a35b89eb3c8f46089208d5785445c01d382b9a153df9"

const JULIAN_SPENDING_KEY = Buffer.from(
  "0000000000000000004e836dac37234f08916ee886c8a6834816a0520b3d666bd4edf42130f826cae2f2f0a4269a23688eabaa3fbfb6129597d4d18416b82ee357ee2e56b3ccf212059132f42f1aa75413d6ca57d6c288db3cb0125dfe078f678ef25627fc5862880acbbfaef401b0736255d060619f357c81c17074e1007d448bae942a19d33836da047bf52a95387da1b811a35b89eb3c8f46089208d5785445c01d382b9a153df9",
  "hex"
)

const cryptoClient = new TezosCryptoClient()
const saplingCryptoClient = new TezosSaplingCryptoClient(cryptoClient)
const externalProvider = SaplingWasmService.createExternalMethodProvider()
const state = new TezosSaplingState(MERKLE_TREE_HEIGHT)
const encoder = new TezosSaplingEncoder()
const forger = new TezosSaplingForger(
  saplingCryptoClient,
  state,
  encoder,
  externalProvider
)
const protocolNetwork = new TezosProtocolNetwork(
  "Mainnet",
  NetworkType.MAINNET,
  "https://whatever"
)

const bookkeeper = new TezosSaplingBookkeeper(
  MainProtocolSymbols.XTZ,
  protocolNetwork,
  saplingCryptoClient,
  encoder
)

async function prepareShieldTransaction(
  publicKey: string,
  recipient: string,
  value: string,
  fee: string,
  data?: { overrideFees?: boolean }
): Promise<string> {
  if (!TezosSaplingAddress.isZetAddress(recipient)) {
    return Promise.reject(
      `Invalid recipient, expected a 'zet' address, got ${recipient}`
    )
  }

  const [saplingStateDiff, chainId]: [TezosSaplingStateDiff, string] =
    await Promise.all([getSaplingStateDiff(CONTRACT_ADDRESS), CHAIN_ID])

  const output: TezosSaplingOutput = {
    address: (await TezosSaplingAddress.fromValue(recipient)).getValue(),
    value,
    memo: Buffer.alloc(MEMO_SIZE).toString("hex"),
  }

  const stateTree: TezosSaplingStateTree =
    await state.getStateTreeFromStateDiff(saplingStateDiff, true)

  const forgedTransaction: TezosSaplingTransaction =
    await forger.forgeSaplingTransaction(
      [],
      [output],
      stateTree,
      getAntiReplay(CONTRACT_ADDRESS, chainId)
    )

  const encodedTransaction: string = encoder
    .encodeTransaction(forgedTransaction)
    .toString("hex")
  console.log(encodedTransaction)
  return encodedTransaction
}

async function chooseInputs(
  viewingKey: Buffer | string,
  commitmentsWithCiphertext: [string, TezosSaplingCiphertext][],
  nullifiers: string[],
  value: string | number | BigNumber
): Promise<[TezosSaplingInput[], BigNumber]> {
  const unspends: TezosSaplingInput[] = await bookkeeper.getUnspends(
    viewingKey,
    commitmentsWithCiphertext,
    nullifiers
  )
  const balance: BigNumber = bookkeeper.sumNotes(unspends)

  if (balance.lt(value)) {
    return Promise.reject("Not enough balance")
  }

  const chosenUnspends: TezosSaplingInput[] = []
  let toSpend: BigNumber = new BigNumber(0)

  for (const unspend of unspends) {
    if (toSpend.gte(value)) {
      break
    }

    toSpend = toSpend.plus(unspend.value)
    chosenUnspends.push(unspend)
  }

  return [chosenUnspends, toSpend]
}

async function getAddressFromPublicKey(
  viewingKey: string
): Promise<TezosSaplingAddress> {
  return TezosSaplingAddress.fromViewingKey(viewingKey)
}

async function prepareUnshieldTransaction(
  viewingKey: string,
  recipient: string,
  value: string,
  data?: any
): Promise<RawTezosSaplingTransaction> {
  if (!TezosAddress.isTzAddress(recipient)) {
    return Promise.reject(
      `Invalid recpient, expected a 'tz' address, got ${recipient}`
    )
  }

  const [stateDiff, chainId]: [TezosSaplingStateDiff, string] =
    await Promise.all([getSaplingStateDiff(CONTRACT_ADDRESS), CHAIN_ID])

  const [inputs, toSpend]: [TezosSaplingInput[], BigNumber] =
    await chooseInputs(
      viewingKey,
      stateDiff.commitments_and_ciphertexts,
      stateDiff.nullifiers,
      value
    )

  const paybackOutput: TezosSaplingOutput = {
    address: (await getAddressFromPublicKey(viewingKey)).getValue(),
    value: toSpend.minus(value).toString(),
    memo: Buffer.alloc(MEMO_SIZE).toString("hex"),
  }

  return {
    ins: inputs,
    outs: [paybackOutput],
    chainId,
    stateDiff,
    callParameters: "",
  }
}

async function signWithPrivateKey(
  privateKey: Buffer,
  transaction: RawTezosSaplingTransaction
): Promise<string> {
  const stateTree: TezosSaplingStateTree =
    await state.getStateTreeFromStateDiff(transaction.stateDiff)

  const forgedTransaction: TezosSaplingTransaction =
    await forger.forgeSaplingTransaction(
      transaction.ins,
      transaction.outs,
      stateTree,
      getAntiReplay(CONTRACT_ADDRESS, transaction.chainId),
      privateKey
    )

  const signed: string = encoder
    .encodeTransaction(forgedTransaction)
    .toString("hex")

  return signed
}

function getAntiReplay(contractAddress: string, chainId: string): string {
  return contractAddress + chainId
}

async function getSaplingStateDiff(contractAddress) {
  const method = "GET"
  const url = `/chains/main/blocks/head/context/contracts/${contractAddress}/single_sapling_get_diff`
  let args = [
    "--mode",
    "mockup",
    "--base-dir",
    "/tmp/mockup",
    "rpc",
    method.toLowerCase(),
    url,
  ]

  const res = spawnSync("tezos-client", args, {
    encoding: "utf8",
  })

  const jsonState = JSON.parse(res.stdout)
  return jsonState
}

async function getBalanceOfPublicKey(publicKey: string): Promise<string> {
  const saplingStateDiff: TezosSaplingStateDiff = await getSaplingStateDiff(
    CONTRACT_ADDRESS
  )
  const unspends: TezosSaplingInput[] = await bookkeeper.getUnspends(
    publicKey,
    saplingStateDiff.commitments_and_ciphertexts,
    saplingStateDiff.nullifiers
  )

  const balance: BigNumber = unspends.reduce(
    (sum: BigNumber, next: TezosSaplingInput) => sum.plus(next.value),
    new BigNumber(0)
  )

  return balance.toString()
}

async function main() {
  const [spendParams, outputParams] = await getOrFetchParameters()
  externalProvider.initParameters(spendParams, outputParams)

  const command = process.argv[2]
  console.log(command)
  if (command == "balance") {
    const balance = await getBalanceOfPublicKey(JULIAN_VIEWING_KEY)
    console.log(balance)
  } else if (command == "address") {
    let addr = await TezosSaplingAddress.fromViewingKey(JULIAN_VIEWING_KEY)
    console.log(addr)
  } else if (command == "unshield") {
    const preparedSaplingTx = await prepareUnshieldTransaction(
      JULIAN_VIEWING_KEY,
      "tz1faswCTDciRzE4oJ9jn2Vm2dvjeyA9fUzU", //bootstrap3
      "1"
    )
    const payload = await signWithPrivateKey(
      JULIAN_SPENDING_KEY,
      preparedSaplingTx
    )
    console.log(payload)
  } else {
    await prepareShieldTransaction(
      "edpkuBknW28nW72KG6RoHtYW7p12T6GKc7nAbwYX5m8Wd9sDVC9yav",
      "zet13skGir8F1wBdnTWydZ3EH1HthsoPFy4bt64EvvSouQM6C2oeCcYZXPv3X4J1iHUqu", //julian
      "1000000",
      "1"
    )
  }
}

;(async () => {
  try {
    await main()
  } catch (e) {
    console.error(e)
  }
})()
