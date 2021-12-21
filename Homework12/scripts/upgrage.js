const { ethers, upgrades } = require("hardhat");

async function main() {
  // Deploying
  const Volcano = await ethers.getContractFactory("Volcano");
  const instance = await upgrades.deployProxy(Volcano, [42]);
  await instance.deployed();

  // Upgrading
  const VolcanoV2 = await ethers.getContractFactory("VolcanoV2");
  const upgraded = await upgrades.upgradeProxy(instance.address, VolcanoV2);
}

main();
