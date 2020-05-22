let SFS2X = require('sfs2x-api');
let PAKO = require('pako');
let BASE64JS = require('base64-js');

let ParseDir = `./sfs/4JavaScript`;
module.exports = {
  init: function (parseDir) {
    ParseDir = parseDir;
  },
  unwrapObj: function (dataIn, sfsObjType) {
    if (sfsObjType == null || sfsObjType === '') {
      return dataIn;
    }

    if (dataIn == null) {
      return dataIn;
    }

    let unbase64Data = BASE64JS.toByteArray(dataIn);
    let unzipData = PAKO.ungzip(unbase64Data);
    let sfsObj = SFS2X.SFSObject.newFromBinaryData(unzipData);

    let parser = require(`${ParseDir}/${sfsObjType}Parser`);
    let jsObj = null;
    try {
      if (parser.req != null) {
        jsObj = parser.req.decode(sfsObj);
      } else {
        jsObj = parser.decode(sfsObj);
      }
    } catch (e) {
      throw `SFSWrapper decode ${sfsObjType} failed: ${e.message}`;
    }

    return jsObj;
  },

  wrapObj: function (dataIn, sfsObjType) {
    if (sfsObjType == null || sfsObjType === '') {
      return dataIn;
    }

    if (dataIn == null) {
      return dataIn;
    }

    let parser = require(`${ParseDir}/${sfsObjType}Parser`);
    let sfsObj = null;
    try {
      if (parser.rsp != null) {
        sfsObj = parser.rsp.encode(dataIn);
      } else {
        sfsObj = parser.encode(dataIn);
      }
    } catch (e) {
      throw `SFSWrapper encode ${sfsObjType} failed: ${e.message}\n${JSON.stringify(dataIn, null, 2)}`;
    }

    let binData = sfsObj.toBinary();
    let zipData = PAKO.gzip(binData);
    let base64Data = BASE64JS.fromByteArray(zipData);

    return base64Data;
  }
};
