const { ethers } = require("hardhat");

const getErc721TokenBal = async () => {
  const name = "TokenizerErc721";
  const signer = await ethers.getSigner();
  const tokenizerErc721 = await ethers.getContractAt(
    name,
    "0x970Af624fFF740E19dBDAFE0E0Ef4DB8eD53855c"
  );
  const tokenBal = await tokenizerErc721.balanceOf(signer.address);
  console.log("ERC721 Token Balance: ", tokenBal);
  return tokenBal;
};

const getErc20TokenBal = async () => {
  const name = "TokenizerErc20";
  const signer = await ethers.getSigner();
  const tokenizerErc20 = await ethers.getContractAt(
    name,
    "0x0D00624ce2C48542f036de97Edf736c64B0df53F"
  );
  const tokenBal = await tokenizerErc20.balanceOf(signer.address);
  console.log("ERC20 Token Balance: ", tokenBal);
  return tokenBal;
};

const main = async () => {
  getErc721TokenBal();
  getErc20TokenBal();
};

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
