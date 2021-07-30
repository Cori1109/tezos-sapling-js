import * as fs from "fs"
import * as path from "path"

import axios, { AxiosResponse } from "axios"

const SAPLING_PARAMS_DIR = path.resolve(__dirname, "sapling-params")
const SPEND_PARAMS_FILE_NAME = "sapling-spend.params"
const OUTPUT_PARAMS_FILE_NAME = "sapling-output.params"
const ZCASH_DOWNLOAD_URL = "https://download.z.cash/downloads"

export async function getOrFetchParameters(): Promise<[Buffer, Buffer]> {
  return Promise.all([
    prepareParams(SPEND_PARAMS_FILE_NAME),
    prepareParams(OUTPUT_PARAMS_FILE_NAME),
  ])
}

async function fetchSaplingParams(name: string): Promise<void> {
  const response: AxiosResponse = await axios.get(
    `${ZCASH_DOWNLOAD_URL}/${name}`,
    { responseType: "stream" }
  )

  fs.mkdirSync(SAPLING_PARAMS_DIR, { recursive: true })
  const writer: fs.WriteStream = fs.createWriteStream(
    path.resolve(SAPLING_PARAMS_DIR, name)
  )

  return new Promise((resolve, reject) => {
    response.data.pipe(writer)
    let error: Error | undefined = undefined
    writer.on("error", (err: Error) => {
      error = err
      writer.close()
    })

    writer.on("close", () => {
      if (error !== undefined) {
        reject(error)
      } else {
        resolve()
      }
    })
  })
}

async function prepareParams(name: string): Promise<Buffer> {
  const paramsFilePath: string = path.resolve(SAPLING_PARAMS_DIR, name)

  if (!fs.existsSync(paramsFilePath)) {
    console.log("No sapling params found. Fetching ones...")
    await fetchSaplingParams(name)
  }

  return fs.readFileSync(paramsFilePath)
}
