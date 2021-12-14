// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/utils/Counters.sol";

contract EncodeToken is ERC721URIStorage {
    using Counters for Counters.Counter;
    Counters.Counter private _tokenIds;

    constructor() ERC721("EncodeToken", "ENC") {}

    mapping(address => uint256[]) internal nfts;

    function mintToken(address tokenOwner, string memory tokenURI)
        public
        returns (uint256)
    {
        _tokenIds.increment();
        uint256 newItemId = _tokenIds.current();
        _mint(tokenOwner, newItemId);
        _setTokenURI(newItemId, tokenURI);
        nfts[tokenOwner].push(newItemId);
        return newItemId;
    }

    function getNfts(address tokenOwner)
        public
        view
        returns (uint256[] memory)
    {
        return nfts[tokenOwner];
    }

    function transferNft(
        address oldOwner,
        address newOwner,
        uint256 index
    ) public {
        // Make transfer
        safeTransferFrom(oldOwner, newOwner, index);
        // Correct for zero-indexed array
        uint _index = index-1;
        nfts[newOwner].push(nfts[oldOwner][_index]);
        delete nfts[oldOwner][_index];
        // What happens if you swap the two previous commands around?        
    }
}
