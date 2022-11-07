require("@nomicfoundation/hardhat-toolbox");

module.exports = {
  solidity: "0.8.17",
  networks: {
    ganache: {
      url: "HTTP://172.18.48.1:7545",
    },
  },
};
