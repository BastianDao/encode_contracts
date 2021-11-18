//SPDX-License-Identifier: GPL-3.0
pragma solidity ^0.8.0;

import "../node_modules/@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "../node_modules/@openzeppelin/contracts/ownership/Ownable.sol";

contract VolcanoCoin is ERC721, Ownable {
  uint256 internal totalNumberOfTokens;

  struct MetaData {
    uint256 timestamp;
    uint256 tokenID;
    string tokenURI;
  }

  mapping(address => NFTs[]) userNFTs;

  function mintToken(address _to) public {
    _safeMint(_to, totalNumberOfTokens, "");

    tokenMetaData = MetaData(block.timestamp, totalNumberOfTokens, tokenURI(totalNumberOfTokens));
    userNFTs[_to].push(tokenMetaData);
    totalNumberOfTokens++;
  }

  function burnToken(uint _tokenId) public {
    findTokenToRemoveMetaData(_tokenId);
    _burn(_tokenId);
  }

  function findTokenToRemoveMetaData(_tokenId) internal {
    require(ownerOf(_tokenId) == msg.sender, "You are not the owner of the token");

    for (uint i=0; i<userNFTs[msg.sender].length; i++) {
      if (userNFTs[msg.sender][i].tokenID == _tokenId) {
        delete userNFTs[msg.sender][i];
        if (userNFTs[msg.sender].length == 0) {
          delete(userNFTs[msg.sender]);
        }
      }
    }
  }

}