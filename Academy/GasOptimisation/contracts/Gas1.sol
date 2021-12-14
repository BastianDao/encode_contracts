// SPDX-License-Identifier: UNLICENSED
pragma solidity 0.8.0;
import "@openzeppelin/contracts/access/Ownable.sol";

contract Constants {
    bool tradeFlag = true;
    bool dividendFlag = true;
}


contract GasContract is Ownable, Constants{

    uint public totalSupply; // cannot be updated
    uint paymentCounter;
    uint tradePercent = 12;

    address [5] public administrators;
    enum PaymentType { Unknown, BasicPayment, Refund, Dividend, GroupPayment }
    PaymentType constant defaultPayment = PaymentType.Unknown;

    mapping(address => uint256) balances;
    mapping(address => Payment[]) payments;
    History[] paymentHistory; // when a payment was updated   

    struct Payment {
      uint paymentID;
      PaymentType paymentType;
      address recipient;
      string recipientName;  // max 8 characters
      bool adminUpdated;
      address admin;    // administrators address
      uint amount;
    }

    struct History {
        uint256 lastUpdate;
        uint256 blockNumber;
        address updatedBy;  
    }

    modifier onlyAdminOrOwner {
        require(msg.sender == owner() || checkForAdmin(msg.sender), "Error in Gas contract - onlyAdminOrOwner modifier");
        _;
    }

    event supplyChanged(address indexed, uint256 indexed);
    event Transfer(address recipient, uint256 amount);
    event PaymentUpdated(address  admin, uint256  ID, uint256  amount, string  recipient);


   constructor(address[] memory _admins, uint256 _totalSupply) {
        totalSupply = _totalSupply;
    
        for (uint256 ii = 0;ii<administrators.length;ii++){
            if(_admins[ii] != address(0)){
                administrators[ii] = _admins[ii];
                if(_admins[ii]==msg.sender){
                    balances[msg.sender] = _totalSupply;
                }
                else {
                    balances[_admins[ii]] = 0;
                }
                
                emit supplyChanged(_admins[ii], balances[_admins[ii]]); 
            }
        }   
   }

   function checkForAdmin(address _user) public view returns (bool admin_) {
       for (uint256 ii = 0; ii< administrators.length;ii++){
          if(administrators[ii] == _user){
              return true;
          } else{
              return false;
          }
       }
   }
   
    function balanceOf(address _user) public view returns (uint balance_){
        return  balances[_user];
    }
 

    function getTradingMode() public view returns (bool mode_){
         if (tradeFlag || dividendFlag) {
             return true;
         } else{
             return false;
         }
     }

    function addHistory(address _updateAddress) private {
        History memory history;
        history.blockNumber = block.number;
        history.lastUpdate = block.timestamp;
        history.updatedBy = _updateAddress;
        paymentHistory.push(history);
    }

   function getPayments(address _user) public view returns (Payment[] memory payments_) {
        require(_user != address(0) ,"Gas Contract - getPayments function - User must have a valid non zero address");
        return payments[_user];
   }

    function transfer(address _recipient, uint _amount, string calldata _name) public returns (bool status_) {
        require(balances[msg.sender] >= _amount,"Gas Contract - Transfer function - Sender has insufficient Balance");
        require(bytes(_name).length < 9,"Gas Contract - Transfer function -  The recipient name is too long, there is a max length of 8 characters");
        balances[msg.sender] -= _amount;
        balances[_recipient] += _amount;
        emit Transfer(_recipient, _amount);
        Payment memory payment;
        payment.admin = address(0);   
        payment.adminUpdated = false;
        payment.paymentType = PaymentType.BasicPayment;
        payment.recipient = _recipient;
        payment.amount = _amount;
        payment.recipientName = _name;
        payment.paymentID = ++paymentCounter;
        payments[msg.sender].push(payment);
        
        return true;
   }

    function updatePayment(address _user, uint _ID, uint _amount,PaymentType _type ) public onlyAdminOrOwner {
        require(_ID > 0,"Gas Contract - Update Payment function - ID must be greater than 0");
        require(_amount > 0,"Gas Contract - Update Payment function - Amount must be greater than 0");
        require(_user != address(0) ,"Gas Contract - Update Payment function - Administrator must have a valid non zero address");

        for (uint256 ii=0;ii<payments[_user].length;ii++){
            if(payments[_user][ii].paymentID==_ID){
               payments[_user][ii].adminUpdated = true; 
               payments[_user][ii].admin = _user;
               payments[_user][ii].paymentType = _type;
               payments[_user][ii].amount = _amount;
               addHistory(_user);
               emit PaymentUpdated(msg.sender, _ID, _amount,payments[_user][ii].recipientName);
               break;
            }
        }
    }
}
