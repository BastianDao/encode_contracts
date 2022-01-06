const { expect, use } = require("chai");
const { network, ethers } = require("hardhat");

const { solidity } = require("ethereum-waffle");
use(solidity);

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

    const whale = await ethers.getSigner(
      "0x503828976D22510aad0201ac7EC88293211D23Da"
    );

    const DAI = await CompoundInteraction_Instance.DAIAddress();
    const cDAI = await CompoundInteraction_Instance.CDAIAddress();

    DAI_TokenContract = await ethers.getContractAt("ERC20", DAI);
    cDAI_TokenContract = await ethers.getContractAt("ERC20", cDAI);

    await DAI_TokenContract.connect(whale).transfer(
      owner.address,
      ethers.utils.parseUnits(INITIAL_AMOUNT)
    );

    
  });

  it("should sendDAI to contract", async () => {
    await DAI_TokenContract.transfer(
      CompoundInteraction_Instance.address,
      ethers.utils.parseUnits(INITIAL_AMOUNT)
    );

    const balance = await DAI_TokenContract.balanceOf(CompoundInteraction_Instance.address);

    expect(balance).to.eql(ethers.utils.parseUnits(INITIAL_AMOUNT));
  });

  it("Should mint tokens", async function () {
    const mintedAmount = await CompoundInteraction_Instance.addToCompound(ethers.utils.parseUnits(INITIAL_AMOUNT));
    const balance = await cDAI_TokenContract.balanceOf(CompoundInteraction_Instance.address);
    expect(balance).to.gt(1)
  });
});
