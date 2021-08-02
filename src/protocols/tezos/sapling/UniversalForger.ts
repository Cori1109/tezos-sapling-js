import { TezosSaplingAddress } from "./TezosSaplingAddress"
import { TezosProtocolNetwork } from "../TezosProtocolOptions"
import { getOrFetchParameters } from "./utils/SaplingParamsDownloader"

import { TezosSaplingBuilder } from "./TezosSaplingBuilder"
import {
  TezosSaplingProtocolOptions,
  TezosShieldedTezProtocolConfig,
} from "./TezosSaplingProtocolOptions"

const CONTRACT_ADDRESS = "KT1BwvNBPhyKrV2Zm51LGCLeRExYWMd1Zfh1"

const JULIAN_VIEWING_KEY =
  "0000000000000000004e836dac37234f08916ee886c8a6834816a0520b3d666bd4edf42130f826cae2379a26861252d22605e041b3ec6e19449a23863bce9ff20b78615a58446f7106f31f7a3d0efed751de9585116f73dbab76955d9b4d4378ed256792d57dce70e3cbbfaef401b0736255d060619f357c81c17074e1007d448bae942a19d33836da047bf52a95387da1b811a35b89eb3c8f46089208d5785445c01d382b9a153df9"

const JULIAN_SPENDING_KEY = Buffer.from(
  "0000000000000000004e836dac37234f08916ee886c8a6834816a0520b3d666bd4edf42130f826cae2f2f0a4269a23688eabaa3fbfb6129597d4d18416b82ee357ee2e56b3ccf212059132f42f1aa75413d6ca57d6c288db3cb0125dfe078f678ef25627fc5862880acbbfaef401b0736255d060619f357c81c17074e1007d448bae942a19d33836da047bf52a95387da1b811a35b89eb3c8f46089208d5785445c01d382b9a153df9",
  "hex"
)

async function main() {
  const [spendParams, outputParams] = await getOrFetchParameters()
  const options = new TezosSaplingProtocolOptions(
    new TezosProtocolNetwork(),
    new TezosShieldedTezProtocolConfig("Shielded contract", CONTRACT_ADDRESS)
  )
  const builder = new TezosSaplingBuilder(options)
  builder.initParameters(spendParams, outputParams)

  const command = process.argv[2]
  console.log(command)
  if (command == "balance") {
    const balance = await builder.getBalanceOfPublicKey(JULIAN_VIEWING_KEY)
    console.log(balance)
  } else if (command == "address") {
    let addr = await TezosSaplingAddress.fromViewingKey(JULIAN_VIEWING_KEY)
    console.log(addr)
  } else if (command == "transfer") {
    const rawTransfer = await builder.prepareSaplingTransaction(
      JULIAN_VIEWING_KEY,
      "zet133AJUrVLDjZbY5sg88b7BQvoTNmZL9H8E8jSfLmeW2vxq5Ep1oTdjn6RN8SKU9HZs", //alice
      "100"
    )
    const payload = await builder.signWithPrivateKey(
      JULIAN_SPENDING_KEY,
      rawTransfer
    )
    console.log(payload)
  } else if (command == "unshield") {
    const preparedSaplingTx = await builder.prepareUnshieldTransaction(
      JULIAN_VIEWING_KEY,
      "tz1faswCTDciRzE4oJ9jn2Vm2dvjeyA9fUzU", //bootstrap3
      "1"
    )
    const payload = await builder.signWithPrivateKey(
      JULIAN_SPENDING_KEY,
      preparedSaplingTx
    )
    console.log(payload)
  } else if (command == "shield") {
    const rawShield = await builder.prepareShieldTransaction(
      "edpkuBknW28nW72KG6RoHtYW7p12T6GKc7nAbwYX5m8Wd9sDVC9yav",
      "zet13skGir8F1wBdnTWydZ3EH1HthsoPFy4bt64EvvSouQM6C2oeCcYZXPv3X4J1iHUqu", //julian
      "1000000",
      "1"
    )
    console.log(rawShield)
  } else {
    console.log("unknown command")
  }
}

;(async () => {
  try {
    await main()
  } catch (e) {
    console.error(e)
  }
})()
