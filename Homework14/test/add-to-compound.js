const { expect, use } = require("chai");
const { network, ethers } = require("hardhat");

const { solidity } = require("ethereum-waffle");
use(solidity);

const DAIAddress = "0x6B175474E89094C44Da98b954EedeAC495271d0F";
const cDAIAddress = "0x5d3a536E4D6DbD6114cc1Ead35777bAB948E3643";

describe("Add to Compound", function () {
  let owner;
  let DAI_TokenContract;
  let cDAI_TokenContract;
  const INITIAL_AMOUNT = "1000";

  before(async function () {
    [owner, addr1, addr2, addr3, addr4, addr5] = await ethers.getSigners();

    const CompoundInteraction = await ethers.getContractFactory("CompoundInteraction");
    CompoundInteraction_Instance = await CompoundInteraction.deploy();

    // // This is needed to impersonate an account on the forked network
    // await network.provider.request({
    //   method: "hardhat_impersonateAccount",
    //   params: ["0x503828976D22510aad0201ac7EC88293211D23Da"],
    // });

    // const whale = await ethers.getSigner(
    //   "0x503828976D22510aad0201ac7EC88293211D23Da"
    // );

    const DAI = await CompoundInteraction_Instance.DAIAddress();
    const cDAI = await CompoundInteraction_Instance.cDAIAddress();

    DAI_TokenContract = await ethers.getContractAt("Erc20", DAI);
    cDAI_TokenContract = await ethers.getContractAt("CErc20", cDAI);

    // await DAI_TokenContract.connect(whale).transfer(
    //   owner.address,
    //   ethers.utils.parseUnits(INITIAL_AMOUNT)
    // );

    
  });

  it("Should mint tokens", async function () {
    const mintedAmount = await CompoundInteraction_Instance.addToCompound(25000);

    // const cDAIBalance = await cDAI_TokenContract.getBalance();
    expect(mintedAmount).to.equal(25000)
  });
});
