#!/usr/bin/env bash

npm run-script build
pm2 start ecosystem.config.js
