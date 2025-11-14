// scripts/seed-minimal-sepolia.js

const { ethers } = require("hardhat");
const config = require("../src/config.json");

// Helpers
const tokens = (n) => ethers.utils.parseUnits(n.toString(), "ether");

async function main() {
  console.log("🚀 Running Minimal Seed for Sepolia...\n");

  // Load accounts
  const accounts = await ethers.getSigners();
  const user1 = accounts[0]; // your deployer wallet
  const user2 = accounts[1]; // your feeAccount wallet

  console.log("Using accounts:");
  console.log("User1:", user1.address);
  console.log("User2:", user2.address, "\n");

  // Fetch network chain ID
  const { chainId } = await ethers.provider.getNetwork();
  console.log("Using chainId:", chainId);

  // Load deployed contracts from config.json
  const DApp = await ethers.getContractAt("Token", config[chainId].DApp.address);
  const mETH = await ethers.getContractAt("Token", config[chainId].mETH.address);
  const mDAI = await ethers.getContractAt("Token", config[chainId].mDAI.address);
  const exchange = await ethers.getContractAt("Exchange", config[chainId].exchange.address);

  console.log("\nContracts:");
  console.log("DApp:", DApp.address);
  console.log("mETH:", mETH.address);
  console.log("mDAI:", mDAI.address);
  console.log("Exchange:", exchange.address, "\n");

  // --------------------------------------------------------------------------
  // 🔹 SMALL TRANSFER (avoid huge values that revert on Sepolia)
  // --------------------------------------------------------------------------
  const smallAmount = tokens(10);

  console.log(`Transferring ${ethers.utils.formatEther(smallAmount)} mETH to user2...`);

  let tx = await mETH.connect(user1).transfer(user2.address, smallAmount);
  await tx.wait();
  console.log("✔ Transfer complete\n");

  // --------------------------------------------------------------------------
  // 🔹 APPROVE small amount
  // --------------------------------------------------------------------------
  console.log("Approving tokens...");

  tx = await DApp.connect(user1).approve(exchange.address, smallAmount);
  await tx.wait();
  console.log("✔ User1 approved DAPP");

  tx = await mETH.connect(user2).approve(exchange.address, smallAmount);
  await tx.wait();
  console.log("✔ User2 approved mETH\n");

  // --------------------------------------------------------------------------
  // 🔹 DEPOSIT small amount
  // --------------------------------------------------------------------------
  console.log("Depositing tokens...");

  tx = await exchange.connect(user1).depositToken(DApp.address, smallAmount);
  await tx.wait();
  console.log("✔ User1 deposited small DAPP amount");

  tx = await exchange.connect(user2).depositToken(mETH.address, smallAmount);
  await tx.wait();
  console.log("✔ User2 deposited small mETH\n");

  // --------------------------------------------------------------------------
  // 🔹 MAKE ONE ORDER
  // --------------------------------------------------------------------------
  console.log("Creating one order...");

  tx = await exchange
    .connect(user1)
    .makeOrder(mETH.address, tokens(1), DApp.address, tokens(1));

  const receipt = await tx.wait();
  const event = receipt.events.find((e) => e.event === "Order");
  const orderId = event.args.id.toString();

  console.log("✔ User1 made order ID:", orderId);

  // --------------------------------------------------------------------------
  // 🔹 FILL ONE ORDER
  // --------------------------------------------------------------------------
  console.log("Filling the order...");

  tx = await exchange.connect(user2).fillOrder(orderId);
  await tx.wait();

  console.log("✔ User2 filled the order");

  console.log("\n🎉 Minimal seeding on Sepolia completed successfully!");
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
