'use strict'
const merge = require('webpack-merge')
const prodEnv = require('./prod.env')

module.exports = merge(prodEnv, {
  NODE_ENV: '"development"',
  VUE_APP_MAPBOXTOKEN: '"pk.eyJ1IjoiaW90dHdkZXZlbG9wZXIiLCJhIjoiY2tvaThxN21vMDl6MTJxcDhwbjA1NDV2bCJ9.d3Cw_sTsC1wX6kx3R5Cl-g"'
})
