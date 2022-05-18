const path = require('path');
const fs = require('fs');

const YAML = require('yaml');
const express = require('express');
const { createProxyMiddleware } = require('http-proxy-middleware');

function yamlDataHandler(path) {
  const file = fs.readFileSync(path, 'utf8');
  return { yaml: YAML.parse(file) };
}

const { yaml: config } = yamlDataHandler('../config.yaml');

const app = express();

const enableHMR = (config.useHMR || 'true') === 'true';
if (enableHMR && (config.nodeEnv !== 'production')) {
  console.log('Adding dev middlware, enabling HMR');
  /* eslint "global-require": "off" */
  /* eslint "import/no-extraneous-dependencies": "off" */
  const webpack = require('webpack');
  const devMiddleware = require('webpack-dev-middleware');
  const hotMiddleware = require('webpack-hot-middleware');

  const wpconfig = require('./webpack.config.js');
  wpconfig.entry.app.push('webpack-hot-middleware/client');
  wpconfig.plugins = wpconfig.plugins || [];
  wpconfig.plugins.push(new webpack.HotModuleReplacementPlugin());

  const compiler = webpack(wpconfig);
  app.use(devMiddleware(compiler));
  app.use(hotMiddleware(compiler));
}

const apiProxyTarget = config.siteRoot + ':' + config.apiPort;
if (apiProxyTarget) {
  app.use('/api', createProxyMiddleware({ target: apiProxyTarget }));
}

app.use(express.static('public'));

//const UI_API_ENDPOINT = process.env.UI_API_ENDPOINT
  //|| 'http://localhost:3000/graphql';
//const env = { UI_API_ENDPOINT };

//app.get('/env.js', (req, res) => {
  //res.send(`window.ENV = ${JSON.stringify(env)}`);
//});

app.get('*', (req, res) => {
  res.sendFile(path.resolve('public/index.html'));
});

const port = config.uiPort || 8000;

app.listen(port, () => {
  console.log(`UI started on port ${port}`);
});
