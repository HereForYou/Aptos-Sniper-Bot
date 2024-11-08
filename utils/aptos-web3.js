// Create wallet using @aptos-labs/ts-sdk node module
const { Aptos, AptosConfig, Network, Account, Ed25519PrivateKey } = require("@aptos-labs/ts-sdk");
const axios = require("axios");

const config = new AptosConfig({ network: Network.MAINNET });
const aptos = new Aptos(config);
// const Moralis = require("moralis");
// const MORALIS_API_KEY = process.env.MORALIS_API_KEY;

// const getAptosBalance = async (address) => {
//   try {
//     await Moralis.default.start({
//       apiKey: MORALIS_API_KEY,
//     });

//     const response = await Moralis.default.AptosApi.wallets.getCoinBalancesByWallets({
//       ownerAddresses: address,
//       limit: 1,
//     });

//     console.log(response.result);
//   } catch (error) {
//     console.error(error);
//   }
// };

/**
 * The function to create account
 * @returns The account Object with privateKey, publicKey, address if there is no error, otherwise error
 * */
const createAccount = async () => {
  try {
    const account = await Account.generate();
    // await aptos.fundAccount({
    //   accountAddress: account.accountAddress,
    //   amount: 100,
    // });
    return account;
  } catch (error) {
    console.log("Error while creating account: ", error);
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
    // await aptos.fundAccount({
    //   accountAddress: account.accountAddress,
    //   amount: 100,
    // });
    return account;
  } catch (error) {
    return { error };
  }
};

/**
 * The function to get all tokens list from panora dex using panora API
 */
const getTokenList = async () => {
  const end_point = "https://api.panora.exchange/tokenlist";

  const query = {
    isInPanoraTokenList: "true",
  };

  const headers = {
    "x-api-key": "a4^KV_EaTf4MW#ZdvgGKX#HUD^3IFEAOV_kzpIE^3BQGA8pDnrkT7JcIy#HNlLGi",
  };

  const queryString = new URLSearchParams(query);
  const url = `${end_point}?${queryString}`;

  const response = await (
    await fetch(url, {
      method: "GET",
      headers: headers,
    })
  ).json();

  console.log("Token List: ", response.data.length);
};

/**
 * This is the function to swap tokens
 *
 * If there is liquidity pool with from and to token in DEX, it swaps the tokens, otherwise it returns error
 *
 * @param {string} fromToken The token address you want to use
 * @param {string} toToken The token address that you want to get
 * @param {string} fromAmount The amount you use for swap
 * @param {object} account The wallet address that you use to swap tokens
 * @param {number?} slippage
 * @returns If swapping is success, it returns the response otherwise error
 */
async function swapTokens(fromToken, toToken, fromAmount, account, slippage = 0) {
  const end_point = "https://api.panora.exchange/swap";
  const params = {
    chainId: 1,
    fromTokenAddress: fromToken,
    toTokenAddress: toToken,
    fromTokenAmount: fromAmount,
    toWalletAddress: account.accountAddress.toString(),
    slippagePercentage: slippage,
    integratorFeePercentage: 0,
  };

  const headers = {
    Accept: "application/json",
    "x-api-key": "a4^KV_EaTf4MW#ZdvgGKX#HUD^3IFEAOV_kzpIE^3BQGA8pDnrkT7JcIy#HNlLGi",
  };

  try {
    const response = await axios.post(end_point, "", { params, headers });
    console.log("Response.data ==============", response.data, account.accountAddress);

    const txParams = response.data.quotes[0].txData;
    console.log("=============== STEP 1 ===============");

    const transaction = await aptos.transaction.build.simple({
      sender: account.accountAddress,
      data: {
        function: txParams.function,
        functionArguments: txParams.arguments,
        typeArguments: txParams.type_arguments,
      },
    });
    console.log("=============== STEP 2 ===============");

    const senderAuthenticator = aptos.transaction.sign({
      signer: alice,
      transaction,
    });
    console.log("=============== STEP 3 ===============");

    const buyTx = await aptos.transaction.submit.simple({ transaction, senderAuthenticator });
    console.log("=============== STEP 4 ===============");

    const result = await aptos.waitForTransaction(buyTx.hash);
    // const result = await client.waitForTransactionWithResult(buyTx.hash);
    console.log("=============== STEP 5 ===============");

    if (result.vm_status == "Executed successfully") {
      console.log("=============== STEP 6 ===============");
      return result; // Return result if buy is successful
    } else {
      console.log("=============== STEP 7 ===============");
      console.error(`Buy transaction failed with status: ${result.vm_status}`);
      return { error: `Buy transaction failed with status: ${result.vm_status}` };
    }
  } catch (error) {
    console.log("Error while swapping.***********************", error);
    return { error: "Error while swapping." };
  }
}

module.exports = {
  createAccount,
  deriveAccount,
  // getAptosBalance,
  getTokenList,
  swapTokens,
};
