// SPDX-License-Identifier: MIT
pragma solidity ^0.8.2;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract VolcanoNFT is ERC721, ERC721URIStorage, Ownable {
    uint256 internal totalNumberOfTokens;

    struct MetaData {
        uint256 timestamp;
        uint256 tokenID;
        string tokenURI;
    }

    mapping(address => MetaData[]) public userNFTs;

    constructor() ERC721("VolcanoNFT", "VN") {}

    // setBaseUri is no longer available so we're overriding the _baseUri function
    function _baseURI() internal pure override returns (string memory) {
        return "ipfs://";
    }

    function tokenURI(uint256 tokenId) public view override(ERC721, ERC721URIStorage) returns (string memory) {
        return super.tokenURI(tokenId);
    }

    function mintToken(address _to, string memory _cid) public {
        _safeMint(_to, totalNumberOfTokens);
        _setTokenURI(totalNumberOfTokens, _cid);

        MetaData memory tokenMetaData = MetaData(block.timestamp, totalNumberOfTokens, tokenURI(totalNumberOfTokens));
        userNFTs[_to].push(tokenMetaData);
        totalNumberOfTokens++;
    }

    function _burn(uint256 _tokenId) internal override(ERC721, ERC721URIStorage) {
        findTokenToRemoveMetaData(_tokenId);
        super._burn(_tokenId);
    }

    function getMeta(address _nftOwner) external view returns(MetaData[] memory) {
        return userNFTs[_nftOwner];
    }

    function safeTransferFrom(address from, address to, uint256 tokenId) public override virtual {
        findTokenToRemoveMetaData(tokenId);

        MetaData memory meta = MetaData(block.timestamp, tokenId, string(abi.encodePacked(_baseURI(), tokenId)));
        userNFTs[to].push(meta);

        super.safeTransferFrom(from, to, tokenId);
    }
    
    function findTokenToRemoveMetaData(uint _tokenId) internal {
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

