//SPDX-License-Identifier: GPL-3.0
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract VolcanoCoin is ERC20, Ownable {
    constructor(uint256 initialSupply) ERC20("Volcano", "VOL") {
        _mint(owner(), initialSupply);
    }

    event TransferOccured(uint256 _amount, address _recipient);
    event SupplyIncrease(uint256 totalSupply);

    struct Payment {
        uint256 amount;
        address sender;
        address recipient;
    }

    mapping(address => Payment[]) public userPayments;

    function isOwner() internal view returns(bool) {
        return owner() == msg.sender;
    }

    function mintMoreTokens(uint256 _tokensToMint) public {
        require(isOwner(), 'Only the owner may mint more tokens');

        _mint(owner(), _tokensToMint);

        emit SupplyIncrease(totalSupply());
    }

    function transfer(address _recipient, uint256 _amount) public override returns (bool){
        _transfer(msg.sender, _recipient, _amount);

        Payment memory payment = Payment(_amount, msg.sender, _recipient);

        userPayments[msg.sender].push(payment);
        emit TransferOccured(_amount, _recipient);

        return true;
    }

}
