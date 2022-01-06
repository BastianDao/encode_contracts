//SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
// import "hardhat/console.sol";
// https://dev.to/ajb413/supplying-assets-to-the-compound-protocol-jda
interface Erc20 {
    function approve(address, uint256) external returns (bool);
    function transfer(address, uint256) external returns (bool);
}

interface CErc20 {
    function mint(uint256) external returns (uint256);
    function exchangeRateCurrent() external returns (uint256);
    function supplyRatePerBlock() external returns (uint256);
    function redeem(uint) external returns (uint);
    function redeemUnderlying(uint) external returns (uint);
}

contract CompoundInteraction {
    address public constant DAIAddress = 0x6B175474E89094C44Da98b954EedeAC495271d0F;
    address public constant cDAIAddress = 0x5d3a536E4D6DbD6114cc1Ead35777bAB948E3643;

    Erc20 DAIContract;
    CErc20 cDAIContract;

    constructor() {
        DAIContract = Erc20(DAIAddress);
        cDAIContract= CErc20(cDAIAddress);
    }

    function addToCompound(uint256 _DAIToAdd) public returns (uint256 mintedAmount_){
        DAIContract.approve(cDAIAddress, _DAIToAdd);
        mintedAmount_ = cDAIContract.mint(_DAIToAdd);
    }
}
