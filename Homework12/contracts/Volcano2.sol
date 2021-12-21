//SPDX-License-Identifier: GPL-3.0
pragma solidity ^0.8.0;

import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import "@openzeppelin/contracts-upgradeable/token/ERC20/ERC20Upgradeable.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/UUPSUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";

contract VolcanoCoin2 is Initializable, ERC20Upgradeable, UUPSUpgradeable, OwnableUpgradeable {
    // constructor(uint256 initialSupply) ERC20("Volcano", "VOL") {
    //     _mint(owner(), initialSupply);
    //     administrator = msg.sender;
    // }
    uint constant public version = 2;
    uint constant initialSupply = 50000;

    function initialize() initializer public {
        __ERC20_init("Volcano", "VOL");
        __Ownable_init();
        __UUPSUpgradeable_init();
        _mint(owner(), initialSupply);
        administrator = msg.sender;
        paymentTypesCount = 4;
    }

    function _authorizeUpgrade(address) internal override onlyOwner {}


    address administrator;

    event TransferOccured(uint256 _amount, address _recipient);
    event SupplyIncrease(uint256 totalSupply);
    
    uint private paymentCounter;
    enum PaymentType { Unknown, BasicPayment, Refund, Dividend, GroupPayment }
    PaymentType constant defaultPayment = PaymentType.Unknown;
    uint private paymentTypesCount;

    struct Payment {
        uint paymentId;
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
        userPayments[msg.sender].push(Payment(++paymentCounter, block.timestamp, _amount, msg.sender, _recipient, "", defaultPayment));
    }

    function viewPayments() public view returns(Payment[] memory payments){
        return userPayments[msg.sender];
    }

    function searchPayments(address _payer, uint256 _paymentId, uint _paymentType) private view returns (Payment[] storage, Payment memory, uint) {
        require(_paymentType <= paymentTypesCount, "PaymentType does not exist");
        
        Payment[] storage paymentsFromAddress = userPayments[_payer];
        require(paymentsFromAddress.length > 0, "user has made no payments");

        Payment memory returnPayment;
        uint index;

        for (uint i=0; i< paymentsFromAddress.length; i++) {
            Payment memory payment = paymentsFromAddress[i];

            if (_paymentId == payment.paymentId) {
                index = i;
                returnPayment = payment;
                break;
            }
        }

        require(returnPayment.paymentId != 0, "Could not find payment");

        return (paymentsFromAddress, returnPayment, index);
    }

    function updatePayment(uint256 _paymentId, uint _paymentType, string memory _comment) public {
        (Payment[] storage paymentsFromAddress, Payment memory payment, uint i) = searchPayments(msg.sender, _paymentId, _paymentType);(msg.sender, _paymentId, _paymentType);
        
        payment.paymentType = PaymentType(_paymentType);
        payment.comment = bytes(payment.comment).length == 0 ? _comment : string(abi.encode(payment.comment, "; ", _comment));
        paymentsFromAddress[i] = payment;

        userPayments[msg.sender] = paymentsFromAddress;
    }

    function updatePaymentAdmin(address _payer, uint256 _paymentId, uint8 _paymentType) public {
        require(msg.sender == administrator, "Admin only action!");        
        (Payment[] storage paymentsFromAddress, Payment memory payment, uint i) = searchPayments(_payer, _paymentId, _paymentType);(_payer, _paymentId, _paymentType);        

        payment.paymentType = PaymentType(_paymentType);
        payment.comment = bytes(payment.comment).length == 0 ? string(abi.encode("updated by ", string(abi.encode(administrator)))) : string(abi.encodePacked(payment.comment, "; updated by ", string(abi.encodePacked(administrator))));
        paymentsFromAddress[i] = payment;

        userPayments[_payer] = paymentsFromAddress;
    }
} 
