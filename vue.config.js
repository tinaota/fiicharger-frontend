
const webpack = require('webpack')
const path = require('path')
const outputDir = 'FiiCharger'
module.exports = {
    publicPath: `/${outputDir}/`,
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
            "/grafii": {
                "target": "http://10.20.23.12"
            },
            "/vehicle": {
                "target": "http://10.20.23.12"
            },
            "/cosmos": {
                "target": "http://10.20.23.12"
            },

        }
    }
}
