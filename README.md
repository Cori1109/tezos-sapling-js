# sapling-forger

Prototype of a standalone utility to forge Sapling transactions for Tezos. 
Based on the amazing AirGap-Coinlib project.

### Installation

```
npm i
```

If you get `Error: Cannot find module 'crypto'`
Then apply the following fix: https://github.com/rustwasm/wasm-bindgen/issues/2323 to the `sapling-wasm` package inside `node_modules`


## Usage

```
ts-node src/protocols/tezos/sapling/UniversalForger.ts <command>
```

### Available commands

+ shield
+ unshield
+ balance
