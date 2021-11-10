 Homework 3 VolcanoCoin contract
Additional Guidance:
Please use the Score contract tutorial as guidance, it has plenty of tips for building your ERC20 contract.
At each point where you change your contract you should re deploy to the JavascriptVM and test your changes.
1. In Remix, create a new file called VolcanoCoin.sol .
2. Define the pragma compiler version to ^0.8.0 .
3. Before the pragma version, add a license identifer // SPDX-License-Identifier: UNLICENSED .
4. Create a contract called VolcanoCoin.
5. Create a variable to hold the total supply of 10000.
6. Make a public function that returns the total supply.
7. Make a function that can increase the total supply. Inside the function, add 1000 tokens to the current total supply.
8. We probably want users to be aware of functions in the contract for greater transparency, but to make them all public will create some security risks (e.g. we don’t want users to be able to change the total supply).
Initialise an address variable called owner .
9. Next, create a modifier which only allows an owner to execute certain functions.
10. Make your increase total supply function public , but add your modifier so that only the owner can execute it.
11. The contract owner’s address should only be updateable in one place. Create a constructor and within the constructor, store the owner’s address.
  
 12. It would be useful to broadcast a change in the total supply. Create an event that emits the new value whenever the total supply changes. When the supply changes, emit this event.
Resources
https://docs.soliditylang.org/en/v0.8.6/ (https://docs.soliditylang.org/en/v0.8.6/)
