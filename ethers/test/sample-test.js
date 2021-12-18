const { expect, use } = require("chai");
const { ethers } = require("hardhat");
const {
  constants, // Common constants, like the zero address and largest integers
  expectRevert, // Assertions for transactions that should fail
} = require("@openzeppelin/test-helpers");

const { solidity } = require("ethereum-waffle");
use(solidity);

// https://www.chaijs.com/guide/styles/ 
// https://ethereum-waffle.readthedocs.io/en/latest/matchers.html

describe("Volcano Coin", () => {
  let volcanoContract;
  let owner, addr1, addr2, addr3;

  beforeEach(async () => {
    const Volcano = await ethers.getContractFactory("VolcanoCoin");
    volcanoContract = await Volcano.deploy();
    await volcanoContract.deployed();

    [owner, addr1, addr2, addr3] = await ethers.getSigners();
  });

  it("has a name", async () => {
    let contractName = await volcanoContract.name();
    expect(contractName).to.equal("Volcano Coin");
  });

  it("reverts when transferring tokens to the zero address", async () => {
    await expectRevert(
      volcanoContract.transfer(constants.ZERO_ADDRESS, 10),
      "ERC20: transfer to the zero address"
    );
  });

  //homework
  it("has a symbol", async () => {
    let contractSymbol = await volcanoContract.symbol();
    expect(contractSymbol).to.equal("VLC")
  });

  it("has 18 decimals", async () => {
    let contractDecimals = await volcanoContract.decimals();
    expect(contractDecimals).to.equal(18)
  });

  it("assigns initial balance", async () => {
    let contractInitialBalance = await volcanoContract.totalSupply();
    expect(contractInitialBalance).to.equal(100000)
  });

  it("increases allowance for address1", async () => {
    let amount = 50000

    let allowance = await volcanoContract.allowance(owner.address, addr1.address);
    let transaction = await volcanoContract.increaseAllowance(addr1.address, amount);
    await transaction.wait();
    let allowanceAfter = await volcanoContract.allowance(owner.address, addr1.address);
    expect(allowanceAfter).to.be.equal(amount);
  });

  it("decreases allowance for address1", async () => {
    let amount = 50000

    let allowance = await volcanoContract.allowance(owner.address, addr1.address);
    let transaction = await volcanoContract.increaseAllowance(addr1.address, amount);
    await transaction.wait();
    let allowanceBefore = await volcanoContract.allowance(owner.address, addr1.address);

    let decreaseAmount = 10000;
    let decreaseTransaction = await volcanoContract.decreaseAllowance(addr1.address, decreaseAmount);
    await decreaseTransaction.wait();
    let allowanceAfter = await volcanoContract.allowance(owner.address, addr1.address);

    expect(allowanceAfter).to.be.equal(40000);
  });

  it("emits an event when increasing allowance", async () => {
    let transaction = volcanoContract.increaseAllowance(addr1.address, 50000);
    expect(transaction).to.emit(volcanoContract, "Approval");
  });

  it("revets decreaseAllowance when trying decrease below 0", async () => {
    expectRevert(volcanoContract.connect(owner).decreaseAllowance(addr2.address, 50000), "ERC20: decreased allowance below zero");
  });

  it("updates balances on successful transfer from owner to addr1", async () => {
    let transaction = await volcanoContract.transfer(addr1.address, 50000);
    transaction.wait();
    let addr1Balance = await volcanoContract.balanceOf(addr1.address)
    let ownerBalance = await volcanoContract.balanceOf(owner.address)
    expect(addr1Balance).to.equal(50000);
  });

  it("revets transfer when sender does not have enough balance", async () => {
    await expect(volcanoContract.connect(addr1).transfer(addr2.address, 100)).to.be.revertedWith("ERC20: transfer amount exceeds balance");
  });

  it("reverts transferFrom addr1 to addr2 called by the owner without setting allowance", async () => {
    let transaction = await volcanoContract.transfer(addr1.address, 10000);
    await transaction.wait()
    await expect(volcanoContract.transferFrom(addr1.address, addr2.address, 10000)).to.be.revertedWith("ERC20: transfer amount exceeds allowance");  });

  it("updates balances after transferFrom addr1 to addr2 called by the owner", async () => {
    let transferAmount = 100;
    let transaction = await volcanoContract.transfer(addr1.address, transferAmount);
    await transaction.wait()

    let transactionAllowance = await volcanoContract.connect(addr1).increaseAllowance(owner.address, transferAmount);
    await transactionAllowance.wait()

    let transactionTransferFrom = await volcanoContract.transferFrom(addr1.address, addr2.address, transferAmount);
    await transactionTransferFrom.wait();

    let addr1Balance = await volcanoContract.balanceOf(addr1.address);
    let addr2Balance = await volcanoContract.balanceOf(addr2.address);

    expect(addr1Balance).to.be.equal(0);
    expect(addr2Balance).to.be.equal(transferAmount);
  });
});
