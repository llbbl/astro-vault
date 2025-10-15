---
title: Webpack - The Battle-Tested Bundler
tags: [webpack, bundler, build-tools]
---

# Webpack

Webpack is a mature, powerful module bundler for JavaScript applications. Despite newer alternatives, it remains the most feature-rich and battle-tested bundler available.

## Key Features

- **Module Federation**: Share code between separate deployments
- **Code Splitting**: Automatic and manual chunking
- **Plugin Ecosystem**: 1000+ plugins available
- **Loader System**: Transform any file type
- **Tree Shaking**: Remove unused code
- **Hot Module Replacement**: Update modules without refresh

## Installation

```bash
pnpm add -D webpack webpack-cli webpack-dev-server
```

## Basic Configuration

```javascript
// webpack.config.js
const path = require('path');

module.exports = {
  mode: 'development',
  entry: './src/index.js',
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: 'bundle.js',
  },
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        use: 'ts-loader',
        exclude: /node_modules/,
      },
      {
        test: /\.css$/,
        use: ['style-loader', 'css-loader'],
      },
    ],
  },
  devServer: {
    static: './dist',
    hot: true,
  },
};
```

## Loaders

### TypeScript
```bash
pnpm add -D ts-loader typescript
```

```javascript
{
  test: /\.tsx?$/,
  use: 'ts-loader',
}
```

### CSS/SASS
```bash
pnpm add -D style-loader css-loader sass-loader sass
```

```javascript
{
  test: /\.scss$/,
  use: ['style-loader', 'css-loader', 'sass-loader'],
}
```

### Assets
```javascript
{
  test: /\.(png|jpg|gif|svg)$/,
  type: 'asset/resource',
}
```

## Plugins

### HTML Plugin
```bash
pnpm add -D html-webpack-plugin
```

```javascript
const HtmlWebpackPlugin = require('html-webpack-plugin');

module.exports = {
  plugins: [
    new HtmlWebpackPlugin({
      template: './src/index.html',
    }),
  ],
};
```

### Mini CSS Extract
```bash
pnpm add -D mini-css-extract-plugin
```

```javascript
const MiniCssExtractPlugin = require('mini-css-extract-plugin');

module.exports = {
  plugins: [new MiniCssExtractPlugin()],
  module: {
    rules: [
      {
        test: /\.css$/,
        use: [MiniCssExtractPlugin.loader, 'css-loader'],
      },
    ],
  },
};
```

## Code Splitting

### Dynamic Imports
```javascript
// Automatic code splitting
import('./module.js').then(module => {
  module.default();
});
```

### Split Chunks
```javascript
module.exports = {
  optimization: {
    splitChunks: {
      chunks: 'all',
      cacheGroups: {
        vendor: {
          test: /[\\/]node_modules[\\/]/,
          name: 'vendors',
        },
      },
    },
  },
};
```

## Module Federation

```javascript
const ModuleFederationPlugin = require('webpack/lib/container/ModuleFederationPlugin');

module.exports = {
  plugins: [
    new ModuleFederationPlugin({
      name: 'app1',
      filename: 'remoteEntry.js',
      exposes: {
        './Component': './src/Component',
      },
      shared: ['react', 'react-dom'],
    }),
  ],
};
```

## Performance Optimization

### Production Build
```javascript
module.exports = {
  mode: 'production',
  optimization: {
    minimize: true,
    usedExports: true, // Tree shaking
  },
};
```

### Bundle Analysis
```bash
pnpm add -D webpack-bundle-analyzer
```

```javascript
const BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin;

module.exports = {
  plugins: [new BundleAnalyzerPlugin()],
};
```

## Resources

- **Docs**: [webpack.js.org](https://webpack.js.org/)
- **GitHub**: [webpack/webpack](https://github.com/webpack/webpack)
