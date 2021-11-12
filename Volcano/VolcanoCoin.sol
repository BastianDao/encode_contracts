//SPDX-License-Identifier: GPL-3.0
pragma solidity ^0.8.0;

contract VolcanoCoin {
    // Public functions have a getter
    uint256 public totalSupply = 10000;
    address private owner;

    struct Payment {
        uint256 amount;
        address recipient;
    }

    struct Wallet {
        uint256 balance;
        uint256 numberOfPayments;
        Payment[] payments;
    }

    mapping(address => Wallet) public wallet;


    event SupplyIncrease(uint256 totalSupply);
    event TransferOccured(uint256 _amount, address _recipient);

    modifier isOwner() {
        require(msg.sender == owner, "Caller is not owner");
        _;
    }

    constructor() {
        owner = msg.sender;
        wallet[msg.sender].balance = totalSupply;
    }

    function transfer(uint256 _amount, address _recipient) public {
        require(wallet[msg.sender].balance >= _amount, "not enough funds");

        wallet[msg.sender].balance -= _amount;
        wallet[_recipient].balance += _amount;
        
        Payment memory payment = Payment(_amount, _recipient);

        wallet[msg.sender].payments.push(payment);
        wallet[msg.sender].numberOfPayments++;

        emit TransferOccured(_amount, _recipient);
    }

    function getAllUsersPayments(address _user) public view returns(Payment[] memory)  {
        return wallet[_user].payments;
    }

    function increaseTotalSupply() public isOwner {
        totalSupply += 1000;

        emit SupplyIncrease(totalSupply);
    }
}