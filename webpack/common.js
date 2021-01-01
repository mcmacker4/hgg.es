const path = require('path')
const HtmlWebpackPlugin = require('html-webpack-plugin')

module.exports = {
    entry: './src/main.ts',
    output: {
        path: path.resolve(__dirname, '../dist'),
        filename: "[hash].js"
    },
    module: {
        rules: [
            {
                test: /\.tsx?$/,
                use: [
                    'babel-loader',
                    'ts-loader'
                ]
            },
            {
                test: /\.jsx?$/,
                loader: 'babel-loader'
            },
            {
                enforce: 'pre',
                test: /\.js$/,
                loader: 'source-map-loader'
            },
            {
                test: /\.s[ac]ss$/,
                use: [
                    'style-loader',
                    'css-loader',
                    'sass-loader'
                ]
            },
            {
                test: /\.(glsl|vert|frag)$/,
                loader: 'raw-loader'
            }
        ]
    },
    resolve: {
        alias: {
            'react': 'preact/compat',
            'react-dom': 'preact/compat'
        },
        extensions: ['.tsx', '.ts', '.jsx', '.js', '.json', '*']
    },
    plugins: [
        new HtmlWebpackPlugin({
            template: './src/misc/index.html'
        })
    ]
}
