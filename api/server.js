const express = require('express');
const path = require('path');
const fs = require('fs');
const YAML = require('yaml');

const { getDirStruct } = require('./recurse-tree.js');

function yamlDataHandler(path) {
  const file = fs.readFileSync(path, 'utf8');
  return { yaml: YAML.parse(file) };
}

const { yaml: config } = yamlDataHandler('../config.yaml');

const app = express();

app.get('/components', async (req, res) => {
  const structure = getDirStruct(config.contentDir, /component[.]yaml/, yamlDataHandler);
  res.send(JSON.stringify(structure));
});

app.listen(config.apiPort, () => {
  console.log(`UI started on port ${config.apiPort}`);
});
