#!/usr/bin/env bash

runRn() {
  cd ./ird-RnBridge
  tsc
  rollup -c ./rollup.config.js
}

runRn