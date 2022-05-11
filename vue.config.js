
const webpack = require('webpack')
const path = require('path')
const outputDir = 'FiiCharger'
module.exports = {
    publicPath: process.env.NODE_ENV === 'production' ? `/${outputDir}/` : '/',
    outputDir: outputDir,
    assetsDir: "static",
    configureWebpack: {
        plugins: [
            new webpack.ProvidePlugin({
                mapboxgl: 'mapbox-gl',
            }),
        ],
        resolve: {
            alias: {
                "imgs": path.resolve(__dirname, 'public/imgs')
            }
        }
    },
    devServer: {
        port: 3000,
        proxy: {
            "/gatekeeper": {
                "target": "http://10.20.23.12"
            },
            "/grafana": {
                "target": "http://10.20.23.12"
            },
            "/vehicle": {
                "target": "http://10.20.23.12"
            },

        }
    }
}