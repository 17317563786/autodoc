// see http://vuejs-templates.github.io/webpack for documentation.
var path = require('path')

module.exports = {
  build: {
    env: require('./prod.env'),
    index: path.resolve(__dirname, '../dist/index.html'),
    assetsRoot: path.resolve(__dirname, '../dist'),
    assetsSubDirectory: 'static',
    assetsPublicPath: '/static/pc/',
    productionSourceMap: true,
    productionGzip: false,
    productionGzipExtensions: ['js', 'css']
  },
  dev: {
    env: require('./dev.env'),
    port: 8088,
    assetsSubDirectory: 'static',
    assetsPublicPath: '/',
    proxyTable: {
        '/api': {
            //target: 'http://192.168.1.95:10001/',
            target: 'http://td.bondowner.cn/',
            //target: 'http://sd.bondowner.cn/',
            //target: 'http://d.bondowner.cn/',
            secure: false,
            changeOrigin: true
        },
        '/notification/sock': {
            // target: 'http://sd.bondowner.cn/',
            target: 'http://td.bondowner.cn/',
            // target: 'http://d.bondowner.cn/',
            changeOrigin: true,
            ws: true,
            headers: {
                host: 'td.bondowner.cn',
                origin: 'http://td.bondowner.cn'
                // host: 'd.bondowner.cn/',
                // origin: 'http://d.bondowner.cn/'
            }
        }
    },
    cssSourceMap: false
  }
}
