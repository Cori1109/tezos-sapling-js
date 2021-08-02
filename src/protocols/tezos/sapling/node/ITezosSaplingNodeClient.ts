import { TezosSaplingStateDiff } from "../../types/sapling/TezosSaplingStateDiff"

export interface ITezosSaplingNodeClient {
  getSaplingStateDiff(contractAddress: string): Promise<TezosSaplingStateDiff>
  getChainId(): Promise<string>
}
