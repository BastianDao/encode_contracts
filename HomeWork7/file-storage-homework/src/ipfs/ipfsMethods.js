// Dependency
import * as IPFS from 'ipfs-core'
import all from 'it-all';

const Buffer = require('buffer/').Buffer

let node;
async function init() {
  node = await IPFS.create();
}

const storeString = async (string) => {
  // Set some data to a variable
  const data = string;

  // Submit data to the network
  const cid = await node.add(data);

  // Log CID to console
  console.log(cid.path);
};

const retrieveString = async (_cid) => {
  // Store CID in a variable
  const cid = _cid //'QmPChd2hVbrJ6bfo3WBcTW4iZnpHm8TEzWkLHmLpXhF68A';
  // QmWdWT5D15ZC7vVJA4qkJHS35K3GdxLMBe4mgiikzZPmXu pengu

  // Retrieve data from CID
  const data = Buffer.concat(await all(node.cat(cid)));

  // return data
  return data.toString();
};

const storeFile = async (file) => {
  let reader = new FileReader()
  reader.readAsArrayBuffer(file)  
  reader.onloadend = () => _saveToIpfs(reader)

}

const getFile = async (_cid, setFile) => {
  let data;
  try {
    // Retrieve data from CID
    data = Buffer.concat(await all(node.cat(_cid)));
  } catch (e) {
    console.log(e, 'e')
  }

  setFile(`data:image/png;base64, 8 ${toBase64(data)}`)
}

// const getFile = async (_cid, setFile) => {
//   let data;
//   // Retrieve data from CID
//   const cid = await all(node.cat(_cid));
//   console.log(cid, 'cid')
//   // try {
//     data = Buffer.concat(cid);
//   // } catch (e) {
//     // console.log(e, 'e')
//   // }

//   setFile(`data:image/png;base64, 8 ${toBase64(data)}`)
// }

const toBase64 = (arr) => {
  const array = new Uint8Array(arr);
  return btoa(array.reduce((data, byte) => data + String.fromCharCode(byte), ''));

}

const _saveToIpfs = async (reader) => {
  const buffer = Buffer.from(reader.result)
  const cid = await node.add(buffer)
  console.log(cid.path, 'cid')
}

init();

export { storeString, retrieveString, storeFile, getFile };