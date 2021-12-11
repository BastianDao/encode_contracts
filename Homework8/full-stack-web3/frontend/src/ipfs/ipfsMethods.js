// Dependency
import * as IPFS from 'ipfs-core'
import all from 'it-all';


let node;
async function init() {
  node = await IPFS.create();
}
init();

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
  const cid = _cid
  // QmdpsbjAF2Y1T43AQUrYmutfGCKZqUvqgJGYxhMWDGWb86 bern

  const chunks = await all(node.cat(cid));
  const response = chunks.reduce((data, byte) => data + new TextDecoder("utf-8").decode(byte), '')
  return response;
};

// onFileUpload
const storeFile = (file, setImage) => {
  let reader = new FileReader();
  reader.readAsDataURL(file);
  reader.onload = async () => {
    const cid = await storeString(reader.result);
    
    setImage(reader.result, cid);
  };
  reader.onerror = (error) => {
      console.log('Error: ', error);
  };
}

const getFile = async (_cid, setImage) => {
  const cid = _cid
  const image = await retrieveString(cid);
  console.log(image, 'image')
  setImage(image)
}

export { storeString, retrieveString, storeFile, getFile };