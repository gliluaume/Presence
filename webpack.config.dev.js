const CopyWebpackPlugin = require('copy-webpack-plugin')
const Path = require('path')
const shared = require('./webpack.config.shared')
const webpack = require('webpack')

const outputFolder = Path.resolve(__dirname, 'public')

module.exports = {
  entry: {
    app: [
      'react-hot-loader/patch',
      'babel-polyfill',
      'webpack-hot-middleware/client',
      Path.resolve(__dirname, 'src/index.js')
    ]
  },
  output: {
    path: outputFolder,
    publicPath: '/',
    filename: '[name].js'
  },
  plugins: [
    new CopyWebpackPlugin([{
      from: 'static',
      to: outputFolder
    }]),
    new webpack.HotModuleReplacementPlugin(),
    new webpack.NoEmitOnErrorsPlugin(),
    new webpack.optimize.CommonsChunkPlugin({
      name: 'vendor',
      minChunks: function (module) {
        return module.context && module.context.indexOf('node_modules') !== -1
      }
    })
  ],
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /node_modules/,
        use: { loader: 'babel-loader', options: shared.getAdjustedBabelOptions() }
      },
      {
        test: /\.css$/,
        use: [
          'style-loader',
          'css-loader',
          { loader: 'postcss-loader', options: { sourceMap: true } }
        ]
      },
      {
        test: /\.styl$/,
        use: [
          'style-loader',
          'css-loader',
          { loader: 'postcss-loader', options: { sourceMap: true } },
          'stylus-loader'
        ]
      },
      {
        test: /\.(jpe?g|png|gif)$/,
        use: { loader: 'url-loader', options: { limit: 10000 } }
      }
    ]
  },
  devtool: '#inline-source-map'
}
