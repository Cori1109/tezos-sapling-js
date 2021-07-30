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

import { SaplingWasmService } from "./SaplingWasmMethodProvider"
import { getOrFetchParameters } from "./utils/SaplingParamsDownloader"

import { spawnSync } from "child_process"

const MERKLE_TREE_HEIGHT = 32
const MEMO_SIZE = 8
const CONTRACT_ADDRESS = "KT19nBTy2vNVzb4pSHoymHrGfyx5C3eBe8Ys"
const CHAIN_ID = "NetXynUjJNZm7wi" // suitable for mockup client

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

async function main() {
  const [spendParams, outputParams] = await getOrFetchParameters()
  externalProvider.initParameters(spendParams, outputParams)

  await prepareShieldTransaction(
    "edpkuBknW28nW72KG6RoHtYW7p12T6GKc7nAbwYX5m8Wd9sDVC9yav",
    "zet13KjZhxpVNB2wkDBbY9inPggnX48SFFNdPrqmV7ndZehQ75F25pZBThovs6VdkLJZV", //bob
    "7000000",
    "1"
  )
}

;(async () => {
  try {
    await main()
  } catch (e) {
    console.error(e)
  }
})()
