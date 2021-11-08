//SPDX-License-Identifier: GPL-3.0
pragma solidity ^0.8.0;

contract Score {

    uint public score;
    address owner;
    
    modifier onlyOwner() {
        if (msg.sender == owner) {
            _;
        }
    }

    event ScoreSet (uint); 
    
    constructor() {
        owner = msg.sender;        
    }

    // @NOTE: making score variable public gives us a getter
    // function getScore() public view returns (uint) {
    //     return score;
    // }
    
    function setScore(uint _newScore) public onlyOwner {
        score = _newScore;
        emit ScoreSet(_newScore);
    }
    
}
