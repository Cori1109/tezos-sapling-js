import axios, { AxiosResponse } from "../../../../dependencies/src/axios-0.19.0"
import { TezosSaplingStateDiff } from "../../types/sapling/TezosSaplingStateDiff"
import { ITezosSaplingNodeClient } from "./ITezosSaplingNodeClient"

export class TezosSaplingNodeClient implements ITezosSaplingNodeClient {
  constructor(private readonly rpcUrl: string) {}

  public async getSaplingStateDiff(
    contractAddress
  ): Promise<TezosSaplingStateDiff> {
    const response: AxiosResponse<TezosSaplingStateDiff> = await axios.get(
      `${this.rpcUrl}/chains/main/blocks/head/context/contracts/${contractAddress}/single_sapling_get_diff`
    )

    return response.data
  }

  public async getChainId(): Promise<string> {
    const response: AxiosResponse<{ chain_id: string }> = await axios.get(
      `${this.rpcUrl}/chains/main/blocks/head/`
    )

    return response.data.chain_id
  }
}
