require("@nomiclabs/hardhat-waffle");
require("dotenv").config();

task("accounts", "Prints the list of accounts", async (_, hre) => {
  const accounts = await hre.ethers.getSigners();
  for (const account of accounts) {
    console.log(account.address);
  }
});

module.exports = {
  solidity: "0.8.9",
  networks: {
    hardhat: {},
    localhost: {
      url: "http://127.0.0.1:8545",
    },
    sepolia: {
      url: process.env.SEPOLIA_RPC,
      accounts: [
        process.env.PRIVATE_KEY_1,
        process.env.PRIVATE_KEY_2
      ].filter(Boolean), // prevents undefined
      chainId: 11155111,
    },
  },
};
