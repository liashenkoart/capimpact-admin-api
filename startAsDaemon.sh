#!/usr/bin/env bash

yarn build
pm2 start ecosystem.config.js
