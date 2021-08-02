import { TezosSaplingStateDiff } from "../../types/sapling/TezosSaplingStateDiff"
import { ITezosSaplingNodeClient } from "./ITezosSaplingNodeClient"

import { spawnSync } from "child_process"

export class TezosSaplingNodeMockupClient implements ITezosSaplingNodeClient {
  constructor() {}

  public async getSaplingStateDiff(
    contractAddress
  ): Promise<TezosSaplingStateDiff> {
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

  public async getChainId(): Promise<string> {
    return "NetXynUjJNZm7wi" // suitable for mockup client
  }
}
