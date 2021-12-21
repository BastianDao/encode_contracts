const { expect, use } = require("chai");
const { ethers, upgrades } = require("hardhat");

const { solidity } = require("ethereum-waffle");
use(solidity);

// https://www.chaijs.com/guide/styles/ 
// https://ethereum-waffle.readthedocs.io/en/latest/matchers.html

describe("Volcano Coin", () => {
  let VolcanoCoin;
  let volcanoCoin;

  let VolcanoCoin2;
  let volcanoCoin2;

  beforeEach(async function () {
      VolcanoCoin = await ethers.getContractFactory("VolcanoCoin");
      volcanoCoin = await upgrades.deployProxy(VolcanoCoin, { kind: 'uups' });
      await volcanoCoin.deployed();
  });

  it("should return it's version", async () => {
      expect(await volcanoCoin.version()).to.equal(1);
  });

  it("should upgrade the implementation contract and return it's version", async () => {
    VolcanoCoin2 = await ethers.getContractFactory("VolcanoCoin2");
    volcanoCoin2 = await upgrades.upgradeProxy(volcanoCoin.address, VolcanoCoin2);
    await volcanoCoin2.deployed();

    expect(await volcanoCoin2.version()).to.equal(2);
  });

});
