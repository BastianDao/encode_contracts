//SPDX-License-Identifier: GPL-3.0
pragma solidity ^0.8.0;

contract VolcanoCoin {
    // Public functions have a getter
    uint256 public totalSupply = 10000;
    address private owner;

    event SupplyIncrease(uint256 totalSupply);


    modifier isOwner() {
        require(msg.sender == owner, "Caller is not owner");
        _;
    }

    constructor() {
        owner = msg.sender;
    }

    function increaseTotalSupply() public isOwner {
        totalSupply += 1000;

        emit SupplyIncrease(totalSupply);
    }
}