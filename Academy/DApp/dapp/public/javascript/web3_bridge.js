$(document).ready(() => {
  // DOM components
  const inputBox = document.getElementById('input-text');
  const cidBox = document.getElementById('ipfs-request');
  const ownerInput = document.getElementById('owner-input');
  const uriInput = document.getElementById('uri-input');
  const txFrom = document.getElementById('tx-from');
  const txTo = document.getElementById('tx-to');
  const tokenId = document.getElementById('token-id');
  // Browser confirmation message
  console.log('web3Bridge.js loaded');
  // Function calls
  $('#mint-nft').click(() => {
    mintNft({
      receiver: ownerInput.value,
      uri: uriInput.value
    });
  });
  $('#get-nfts').click(() => {
    if (ownerInput.value != "") {
      getNfts(ownerInput.value);
    } else {
      alert('Please fill in public key')
    }
  });
  $('#tx-nft').click(() => {
    if (txFrom.value != "" && txTo.value != "" && tokenId.value != "") {
      txNft({
        from: txFrom.value,
        to: txTo.value,
        tokenId: tokenId.value
      });
    } else {
      alert('Please fill in all fields')
    }
  });
  $('#add-data').click(() => {
    addData(inputBox.value);
  });
  $('#add-file').click(() => {
    addFile();
  });
  $('#get-data').click(() => {
    if (cidBox.value != "") {
      getData(cidBox.value);
    } else {
      alert('Please fill in CID')
    }
  });
  $('#get-image').click(() => {
    if (cidBox.value != "") {
      getImage(cidBox.value);
    } else {
      alert('Please fill in CID')
    }
  });
});

async function mintNft(params) {
  const route = 'mintNft';
  const req = {
    params: params
  }
  function update(response) {
    $('#output-text').val(response[0]);
  }
  ajaxCall(route, req, update);
}

async function getNfts(params) {
  const route = 'getNfts';
  const req = {
    params: params
  }
  function update(response) {
    $('#output-text').val(JSON.stringify(response[0]));
  }
  ajaxCall(route, req, update);
}

async function txNft(params) {
  const route = 'txNft';
  const req = {
    params: params
  }
  function update(response) {
    $('#output-text').val(response[0]);
  }
  ajaxCall(route, req, update);
}

async function addFile() {
  const reader = new FileReader();
  reader.onloadend = function () {
    const buf = buffer.Buffer.from(reader.result);
    const route = 'addFile';
    const req = { data: buf };
    function update(response) {
      $('#output-text').val(response.path);
    }
    ajaxCall(route, req, update);
  }
  const file = document.getElementById("file");
  reader.readAsArrayBuffer(file.files[0]);
}

async function addData(newData) {
  const route = 'addData';
  const req = { data: newData };
  function update(response) {
    $('#output-text').val(response.path);
  }
  ajaxCall(route, req, update);
}

async function getData(cid) {
  const route = 'getData';
  const req = { data: cid };
  function update(response) {
    $('#output-text').val(response[0]);
  }
  ajaxCall(route, req, update);
}

async function getImage(cid) {
  const route = 'getImage';
  const req = { data: cid };
  function update(response) {
    function toBase64(arr) {
      arr = new Uint8Array(arr)
      return btoa(
        arr.reduce((data, byte) => data + String.fromCharCode(byte), '')
      );
    }
    $('#ipfs-image').attr('src', `data:image/png;base64,${toBase64(response[0].data)}`);
  }
  ajaxCall(route, req, update);
}