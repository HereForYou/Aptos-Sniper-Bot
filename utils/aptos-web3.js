// Create wallet using @aptos-labs/ts-sdk node module
const { Aptos, AptosConfig, Network, Account, Ed25519PrivateKey } = require("@aptos-labs/ts-sdk");

const config = new AptosConfig({ network: Network.TESTNET });
const aptos = new Aptos(config);

/**
 * The function to create account
 * @returns The account Object with privateKey, publicKey, address if there is no error, otherwise error
 * */
const createAccount = async () => {
  try {
    const account = Account.generate();
    const privateKey = await account.privateKey.toString();
    const address = await account.accountAddress.toString();
    const publicKey = await account.publicKey.toString();
    return {
      privateKey,
      publicKey,
      address,
    };
  } catch (error) {
    return { error };
  }
};

/**
 * The function to derive account
 *
 * @param privateKeyString A private key used to create wallet
 * @returns The account Object with privateKey, publicKey, address if there is no error, otherwise error
 * */
const deriveAccount = async (privateKeyString) => {
  try {
    const ed25519PrivateKey = new Ed25519PrivateKey(privateKeyString);
    const account = Account.fromPrivateKey({ privateKey: ed25519PrivateKey });
    const privateKey = await account.privateKey.toString();
    const address = await account.accountAddress.toString();
    const publicKey = await account.publicKey.toString();
    return {
      privateKey,
      publicKey,
      address,
    };
  } catch (error) {
    return error;
  }
};

// Create wallet using @martiandao/aptos-web3-bip44.js node module
const aptosWeb3 = require("@martiandao/aptos-web3-bip44.js");

// Create aptos devnet wallet client
const NODE_URL = process.env.NODE_URL;
const FAUCET_URL = process.env.FAUCET_URL;
const walletClient = new aptosWeb3.WalletClient(NODE_URL, FAUCET_URL);

// Function to create new wallet
const createWallet = async () => {
  try {
    const wallet = await walletClient.createWallet();
    return wallet;
  } catch (err) {
    console.log("Errir: ", err);
    return;
  }
};

module.exports = {
  createWallet,
  createAccount,
  deriveAccount,
};
