// Library dependency
const Web3 = require('web3');

// Smart contract ABI
const nftAbi = require('./build/contracts/EncodeErc721.json');

// Initialise web3 library
const web3 = new Web3("http://127.0.0.1:8545");

// Set variable here for reuse
const ownerPub = '0x536F8222C676b6566FF34E539022De6c1c22cc06';

// Initialise contract
const encodeNft = new web3.eth.Contract(nftAbi.abi, "0xA97409103E409f93ecB7599C8d2f13a1845049EB");

(async () => {
    // Get contract name
    const name = await encodeNft.methods
        .name().call();

    console.log(name);

    // Get balance
    const balance = await encodeNft.methods
        .balanceOf(ownerPub).call();

    // Log balance
    console.log(balance);
})();