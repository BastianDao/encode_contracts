//SPDX-License-Identifier: GPL-3.0
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract VolcanoCoin is ERC20, Ownable {
    constructor(uint256 initialSupply) ERC20("Volcano", "VOL") {
        _mint(owner(), initialSupply);
        administrator = msg.sender;
    }

    address administrator;

    event TransferOccured(uint256 _amount, address _recipient);
    event SupplyIncrease(uint256 totalSupply);
    
    uint private paymentCounter;
    enum PaymentType { Unknown, BasicPayment, Refund, Dividend, GroupPayment }
    PaymentType constant defaultPayment = PaymentType.Unknown;

    struct Payment {
        uint paymentID;
        uint256 timestamp;
        uint256 amount;
        address sender;
        address recipient;
        string comment;
        PaymentType paymentType;
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

        // Payment memory payment = Payment(_amount, msg.sender, _recipient);
        recordPayment(_recipient, _amount);
        emit TransferOccured(_amount, _recipient);

        return true;
    }

    function recordPayment(address _recipient, uint256 _amount) internal {
        userPayments[msg.sender].push(Payment(++paymentCounter, _amount, _recipient, defaultPayment, "", block.timestamp));
    }

    function viewPayments() public view returns(Payment[] memory payments){
        return userPayments[msg.sender];
    }

    function searchPayments(address _payer, uint256 _paymentId, uint _paymentType) private view returns (Payment[] storage, Payment memory, uint) {
        require(_paymentType <= paymentTypeEnumCount, "PaymentType does not exist");
        
        Payment[] storage userPayments = payments[_payer];
        require(userPayments.length > 0, "user has made no payments");

        Payment memory returnPayment;
        uint index;

        for (uint i=0; i< userPayments.length; i++) {
            Payment memory payment = userPayments[i];

            if (_paymentId == payment.paymentId) {
                index = i;
                returnPayment = payment;
                break;
            }
        }

        require(returnPayment.paymentId != 0, "Could not find payment");

        return (userPayments, returnPayment, index);
    }

    function updatePayment(uint256 _paymentId, uint _paymentType, string memory _comment) public {
        (Payment[] storage userPayments, Payment memory payment, uint i) = searchPayments(_payer, _paymentId, _paymentType);(msg.sender, _paymentId, _paymentType);
        
        payment.paymentType = PaymentType(_paymentType);
        payment.comment = bytes(payment.comment).length == 0 ? _comment : string(abi.encode(payment.comment, "; ", _comment));
        userPayments[i] = payment;

        payments[msg.sender] = userPayments;
    }

    function updatePaymentAdmin(address _payer, uint256 _paymentId, uint8 _paymentType) public {
        require(msg.sender == administrator, "Admin only action!");        
        (Payment[] storage userPayments, Payment memory payment, uint i) = searchPayments(_payer, _paymentId, _paymentType);(_payer, _paymentId, _paymentType);        

        payment.paymentType = PaymentType(_paymentType);
        payment.comment = bytes(payment.comment).length == 0 ? string(abi.encode("updated by ", string(abi.encode(administrator)))) : string(abi.encodePacked(payment.comment, "; updated by ", string(abi.encodePacked(administrator))));
        userPayments[i] = payment;

        payments[_payer] = userPayments;
    }
}
