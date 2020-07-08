const { merge } = require('webpack-merge')


module.exports = merge(require('./common'), {
    mode: 'development',
    devtool: 'source-map'
})