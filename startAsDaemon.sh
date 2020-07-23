#!/usr/bin/env bash
yarn
yarn build
pm2 start ecosystem.config.js
