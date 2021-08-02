import { TezosSaplingExternalMethodProvider } from "./TezosSaplingProtocolOptions"

import {
  withProvingContext,
  initParameters,
  prepareSpendDescription,
  preparePartialOutputDescription,
  createBindingSignature,
} from "@temple-wallet/sapling-wasm"

export class SaplingWasmService {
  constructor() {}

  public static createExternalMethodProvider(): TezosSaplingExternalMethodProvider {
    return {
      initParameters: initParameters,
      withProvingContext: withProvingContext,
      prepareSpendDescription: prepareSpendDescription,
      preparePartialOutputDescription: preparePartialOutputDescription,
      createBindingSignature: createBindingSignature,
    }
  }
}
