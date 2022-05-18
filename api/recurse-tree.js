const fs = require('fs');
const path = require('path');

function recurseDirs(params) {
  //recurse directories, returning details of it and children
  //where file matches are found
  //use of fs.statSync (not lstatSync) means symlinks are followed

  let itemProcessed = false;
  let dirs = [];
  let files = [];
  let children = [];

  // thisDir is an object containing details about this directory
  let thisDir = {};
  thisDir.title = "Empty Title";
  thisDir.relPath = path.relative(params.initPath, params.rootPath);

  // get a list of all directories and files into dirs and (matching) files
  const dircontents = fs.readdirSync(params.rootPath);

  dircontents.forEach((item) => {
    const itemPath = params.rootPath + '/' + item;
    if(fs.statSync(itemPath).isDirectory()) { 
      dirs.push(itemPath) 
    } else if (!params.regex || itemPath.match(params.regex)) {
      files.push(itemPath)
    }
  });

  // if there is only one file add its details to the current directory object
  // for all other files, add them to children
  files.forEach((itemPath) => {
    itemProcessed = true;
    let fileInfo = {};
    fileInfo.relPath = path.relative(itemPath, params.rootPath);
    if(params.fileDataFunc) {
      fileData = params.fileDataFunc(itemPath);
      if(files.length == 1) {
        //this is an index file so add its details to the current path
        thisDir = {...thisDir, ...fileData};
        return;
      } else {
        fileInfo = {...fileInfo, ...fileData};
      }
    }
    children.push(fileInfo);
  });

  // for each directory recurse and add any children
  dirs.forEach((itemPath) => {
    const itemDesc = recurseDirs({...params, rootPath: itemPath});
    if(itemDesc !== null) {
      children.push(itemDesc);
      itemProcessed = true;
    }
  });

  //discard children array if empty, or add it to dir object
  if(children.length > 0) thisDir.children = children;

  // if files (or populated directories) were found, return dir object
  // else return null
  if(itemProcessed) return thisDir;
  else return null;
}

function getDirStruct(path, regex, fileDataFunc) {
  params = { 
    initPath: path,
    rootPath: path, 
    fileDataFunc: fileDataFunc,
    regex: regex
  };
  return recurseDirs(params);
}

module.exports = { getDirStruct };
