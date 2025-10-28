const { ethers } = require("hardhat");
const config = require("../src/config.json");

// Helpers
const tokens = (n) => ethers.utils.parseUnits(n.toString(), "ether");
const wait = (seconds) => new Promise((resolve) => setTimeout(resolve, seconds * 1000));

async function main() {
  const accounts = await ethers.getSigners();
  const user1 = accounts[0];
  const user2 = accounts[1];

  // Fetch network
  const { chainId } = await ethers.provider.getNetwork();
  console.log("Using chainId:", chainId);

  // Fetch deployed contracts
  const DApp = await ethers.getContractAt("Token", config[chainId].DApp.address);
  const mETH = await ethers.getContractAt("Token", config[chainId].mETH.address);
  const mDAI = await ethers.getContractAt("Token", config[chainId].mDAI.address);
  const exchange = await ethers.getContractAt("Exchange", config[chainId].exchange.address);

  console.log(`Contracts fetched:\nDApp: ${DApp.address}\nmETH: ${mETH.address}\nmDAI: ${mDAI.address}\nExchange: ${exchange.address}\n`);

  // Transfer mETH to user2 for testing
  let amount = tokens(10000);
  let transaction = await mETH.connect(user1).transfer(user2.address, amount);
  await transaction.wait();
  console.log(`Transferred ${ethers.utils.formatEther(amount)} mETH to ${user2.address}`);

  // Approvals and deposits
  amount = tokens(10000);

  await DApp.connect(user1).approve(exchange.address, amount);
  await exchange.connect(user1).depositToken(DApp.address, amount);
  console.log(`User1 deposited ${ethers.utils.formatEther(amount)} DApp tokens`);

  await mETH.connect(user2).approve(exchange.address, amount);
  await exchange.connect(user2).depositToken(mETH.address, amount);
  console.log(`User2 deposited ${ethers.utils.formatEther(amount)} mETH tokens\n`);

  // ------------------------------------------------------------------
  // CANCELLED ORDER
  // ------------------------------------------------------------------
  let result, orderId;
  transaction = await exchange.connect(user1).makeOrder(mETH.address, tokens(100), DApp.address, tokens(5));
  result = await transaction.wait();

  orderId = result.events.find((e) => e.event === "Order").args.id;
  console.log(`User1 made order ID ${orderId}`);

  transaction = await exchange.connect(user1).cancelOrder(orderId);
  await transaction.wait();
  console.log(`User1 cancelled order ID ${orderId}\n`);
  await wait(1);

  // ------------------------------------------------------------------
  // FILLED ORDERS
  // ------------------------------------------------------------------
  transaction = await exchange.connect(user1).makeOrder(mETH.address, tokens(100), DApp.address, tokens(10));
  result = await transaction.wait();
  orderId = result.events.find((e) => e.event === "Order").args.id;
  console.log(`User1 made order ID ${orderId}`);

  transaction = await exchange.connect(user2).fillOrder(orderId);
  await transaction.wait();
  console.log(`User2 filled order ID ${orderId}\n`);
  await wait(1);

  transaction = await exchange.connect(user1).makeOrder(mETH.address, tokens(50), DApp.address, tokens(15));
  result = await transaction.wait();
  orderId = result.events.find((e) => e.event === "Order").args.id;
  console.log(`User1 made order ID ${orderId}`);

  transaction = await exchange.connect(user2).fillOrder(orderId);
  await transaction.wait();
  console.log(`User2 filled order ID ${orderId}\n`);
  await wait(1);

  transaction = await exchange.connect(user1).makeOrder(mETH.address, tokens(200), DApp.address, tokens(20));
  result = await transaction.wait();
  orderId = result.events.find((e) => e.event === "Order").args.id;
  console.log(`User1 made order ID ${orderId}`);

  transaction = await exchange.connect(user2).fillOrder(orderId);
  await transaction.wait();
  console.log(`User2 filled order ID ${orderId}\n`);
  await wait(1);

  // ------------------------------------------------------------------
  // OPEN ORDERS
  // ------------------------------------------------------------------
  console.log("Seeding open orders...\n");

  for (let i = 1; i <= 10; i++) {
    transaction = await exchange.connect(user1).makeOrder(mETH.address, tokens(10 * i), DApp.address, tokens(10));
    await transaction.wait();
    console.log(`User1 made order ${i}`);
    await wait(0.5);
  }

  for (let i = 1; i <= 10; i++) {
    transaction = await exchange.connect(user2).makeOrder(DApp.address, tokens(10), mETH.address, tokens(10 * i));
    await transaction.wait();
    console.log(`User2 made order ${i}`);
    await wait(0.5);
  }

  console.log("\n✅ Seeding completed successfully!");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
