const fs = require('fs');
const path = require('path');

function recurseDirs(params) {
  //recurse directories, populating and updating the input params object
  //where matches are found
  //use of fs.statSync (not lstatSync) means symlinks are followed

  const dircontents = fs.readdirSync(params.rootPath);
  let files = [];
  let dirs = [];

  dircontents.forEach((item) => {
    const itemPath = params.rootPath + '/' + item;
    const itemStats = fs.statSync(itemPath);

    let itemDesc = { 
      relPath: path.relative(params.initPath, itemPath), 
      atime: itemStats.atime 
    };

    if(itemStats.isDirectory()) {
      const recurseParams = {
        ...params,
        rootPath: itemPath,
        tree: itemDesc,
        foundFile: false
      }
      const { foundFile, tree } = recurseDirs(recurseParams);

      if(foundFile) {
        dirs.push(tree);
        params.foundFile = true;
      }
    } else if (!params.regex || itemPath.match(params.regex)) {
      if(params.fileDataFunc) {
        itemDesc = { ...itemDesc, ...params.fileDataFunc(itemPath)};
      }
      files.push(itemDesc);
      params.foundFile = true;
    }
  });

  if(dirs.length) params.tree.dirs = dirs;
  if(files.length) params.tree.files = files;

  return params;
}

function getDirStruct(path, regex, fileDataFunc) {
  params = { 
    initPath: path,
    rootPath: path, 
    tree: {},
    fileDataFunc: fileDataFunc,
    regex: regex
  };
  return recurseDirs(params).tree;
}

module.exports = { getDirStruct };
