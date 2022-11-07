const { ethers } = require("hardhat");

const deployTokenizerErc721 = async (deployerAddress) => {
  const fee = ethers.utils.parseEther("0.1");
  const rewardsAmount = ethers.utils.parseEther("1");
  const TokenizerErc721 = await ethers.getContractFactory("TokenizerErc721");
  const tokenizerErc721 = await TokenizerErc721.deploy(
    "Tokenizers",
    "TKZ",
    fee,
    rewardsAmount,
    {
      from: deployerAddress,
    }
  );
  await tokenizerErc721.deployed();
  console.log(`TokenizerErc721 deployed to ${tokenizerErc721.address}`);
  return tokenizerErc721.address;
};

const deployTokenizerErc20 = async (
  deployerAddress,
  tokenizerErc721Address
) => {
  const TokenizerErc20 = await ethers.getContractFactory("TokenizerErc20");
  const tokenizerErc20 = await TokenizerErc20.deploy(
    "Tokies",
    "TKI",
    tokenizerErc721Address,
    {
      from: deployerAddress,
    }
  );
  await tokenizerErc20.deployed();
  console.log(`TokenizerErc20 deployed to ${tokenizerErc20.address}`);
  return tokenizerErc20.address;
};

const main = async () => {
  const deployer = ethers.getSigner();
  const tokenizerErc721Address = deployTokenizerErc721(deployer.address);
  deployTokenizerErc20(deployer.address, tokenizerErc721Address);
};

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
