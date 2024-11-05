const aptosWeb3 = require("@martiandao/aptos-web3-bip44.js");

// Create aptos devnet wallet client
const NODE_URL = process.env.NODE_URL;
const FAUCET_URL = process.env.FAUCET_URL;
const walletClient = new aptosWeb3.WalletClient(NODE_URL, FAUCET_URL);

// Function to create new wallet
const createWallet = async () => {
  try {
    const wallet = await walletClient.createWallet();
    console.log("This is wallet address: ", wallet);
  } catch (err) {
    console.log("Errir: ", err);
  }
};

module.exports = {
  createWallet,
};
