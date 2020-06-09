#!/usr/bin/env bash

runHy() {
  cd ./ird-HyBridge
  tsc
  rollup -c ./rollup.config.js
}

runHy