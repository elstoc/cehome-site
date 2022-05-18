const path = require('path');
const fs = require('fs');

const express = require('express');
const YAML = require('yaml');

const { getDirStruct } = require('./recurse-tree.js');

function yamlDataHandler(path) {
  const file = fs.readFileSync(path, 'utf8');
  return YAML.parse(file);
}

const config = yamlDataHandler('../config.yaml');

const app = express();

app.get('/api/components', async (req, res) => {
  const structure = getDirStruct(config.contentDir, /component[.]yaml/, yamlDataHandler);
  res.send(JSON.stringify(structure));
});

app.listen(config.apiPort, () => {
  console.log(`API started on port ${config.apiPort}`);
});
