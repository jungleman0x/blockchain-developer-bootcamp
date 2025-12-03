require("@nomiclabs/hardhat-waffle");
require("dotenv").config();
const privateKeys = process.env.PRIVATE_KEYS || "";


task("accounts", "Prints the list of accounts", async (_, hre) => {
  const accounts = await hre.ethers.getSigners();
  for (const account of accounts) {
    console.log(account.address);
  }
});


module.exports = {
  solidity: "0.8.9",
  networks: {
    localhost: {},

    sepolia: {
      url: `https://sepolia.infura.io/v3/${process.env.INFURA_API_KEY}`,
      accounts: privateKeys.split(","),
    },

    polygon: {
      url: `https://polygon-mainnet.infura.io/v3/${process.env.INFURA_API_KEY}`,
      accounts: privateKeys.split(","),
    },

    polygonMumbai: {
      url: `https://polygon-mumbai.infura.io/v3/${process.env.INFURA_API_KEY}`,
      accounts: privateKeys.split(","),
    },
  },
};
