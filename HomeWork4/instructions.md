 Homework 4
1. In order to keep track of user balances, we need to associate a user’s address with the balance that they have.
a) What is the best data structure to hold this association ?
b) Using your choice of data structure, set up a variable called balance to keep track of the number of volcano coins that a user has.
2. We want to allow the balance variable to be read from the contract, there are 2 ways to do this.
a) What are those ways ?
b) Use one of the ways to make your balances variable visible to users of the contract.
3. Now change the constructor, to give all of the total supply to the owner of the contract.
4. Now add a public function called transfer to allow a user to transfer their tokens to another address.
This function should have 2 parameters :
the amount to transfer and the recipient address.
a) Why do we not need the sender’s address here ?
b) What would be the implication of having the sender’s address as a parameter ?
5. Add an event to the transfer function to indicate that a transfer has taken place, it should record the amount and the recipient address.
6. We want to keep a record for each user’s transfers. Create a struct called Payment that can be used to hold the transfer amount and the recipient’s address.
7. We want to reference a payments array to each user sending the payment. Create a mapping which returns an array of Payment structs when given this user’s address.
Resources
https://docs.soliditylang.org/en/v0.8.10/ (https://docs.soliditylang.org/en/v0.8.10/)
   