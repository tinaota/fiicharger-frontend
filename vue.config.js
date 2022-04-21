
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
            '/api': {
                target: 'https://test-charger.fiimart.com',//'10.64.32.208',//'http://61.129.93.20',
                changeOrigin: true,
                pathRewrite: {
                    '^/api': '/'
                }
            },
        }
    }
}