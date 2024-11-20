// Create wallet using @aptos-labs/ts-sdk node module
const { Aptos, AptosConfig, Network, Account, Ed25519PrivateKey } = require("@aptos-labs/ts-sdk");
const axios = require("axios");

const config = new AptosConfig({ network: Network.MAINNET });
const aptos = new Aptos(config);

/**
 *
 * @param {Array} address
 * @returns
 */
const getAptosBalance = async (addresses) => {
  try {
    const coinsData = await Promise.all(
      addresses.map(async (address) => {
        const coinData = await aptos.getAccountCoinsData({ accountAddress: address });
        console.log(coinData);
        const coins = [];
        const temp = { amount: 100000000 * 10 ** 8 };
        for (let i = 0; i < coinData.length; i++) {
          if (coinData[i].metadata.symbol === "APT" && temp.amount > coinData[i].amount) {
            temp.symbol = coinData[i].metadata.symbol;
            temp.name = coinData[i].metadata.name;
            temp.decimals = coinData[i].metadata.decimals;
            temp.amount = coinData[i].amount;
          } else if (coinData[i].metadata.symbol !== "APT") {
            coins.push({
              symbol: coinData[i].metadata.symbol,
              name: coinData[i].metadata.name,
              decimals: coinData[i].metadata.decimals,
              amount: coinData[i].amount,
            });
          }
        }
        if (temp.symbol) coins.push(temp);
        return coins;
      })
    );
    return coinsData;
  } catch (error) {
    console.error("Something went wrong while getting coins data of account.", error);
  }
};

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
async function swapTokens(fromToken, toToken, fromAmount, account, slippage = 10) {
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
    console.log("Response.data ==============", response.data);

    const txParams = response.data.quotes[0].txData;
    console.log("=============== STEP 1 ===============");
    derivedAccount = await deriveAccount(account.privateKey);

    const expireTimestamp = Math.floor(Date.now() / 1000) + 30;
    const transaction = await aptos.transaction.build.simple({
      sender: derivedAccount.accountAddress,
      data: {
        function: txParams.function,
        functionArguments: txParams.arguments,
        typeArguments: txParams.type_arguments,
      },
      options: { expireTimestamp: expireTimestamp * 1000, maxGasAmount: 1000 },
    });
    console.log("=============== STEP 2 ===============", transaction);

    const senderAuthenticator = await aptos.transaction.sign({
      signer: derivedAccount,
      transaction,
    });
    console.log("=============== STEP 3 ===============");

    const buyTx = await aptos.transaction.submit.simple({ transaction, senderAuthenticator });
    console.log("=============== STEP 4 ===============");

    const result = await aptos.waitForTransaction({ transactionHash: buyTx.hash });
    console.log("=============== STEP 5 ===============");

    if (result.vm_status == "Executed successfully") {
      console.log("=============== STEP 6 ===============");
      return {
        fromTokenPrice: response.data.fromToken.current_price,
        fromTokenAmount: response.data.fromTokenAmount,
        fromTokenAmountUSD: response.data.fromTokenAmountUSD,
        toTokenPrice: response.data.toToken.current_price,
        toTokenAmount: response.data.quotes[0].toTokenAmount,
        toTokenAmountUSD: response.data.quotes[0].toTokenAmountUSD,
        slippagePercentage: response.data.quotes[0].slippagePercentage,
        priceImpact: response.data.quotes[0].priceImpact,
        accountAddress: account.accountAddress.toString(),
      }; // Return result if buy is successful
    } else {
      console.log("=============== STEP 7 ===============");
      console.error(`Buy transaction failed with status: ${result.vm_status}`);
      return { error: `Buy transaction failed with status: ${result.vm_status}` };
    }
  } catch (error) {
    console.error("Error while swapping.***********************", error);
    return { error: error.data ?? "Sorry, something went wrong while swapping." };
  }
}

/**
 * Returns Boolean to indicates that token is added to liquidity with APT
 *
 * @param {String} tokenAddress the token address you want to verify
 * @param {Object} account the account you want to use to verify
 * @returns If the token is added to liquidty with APT returns true, otherwise false
 */
async function verifyToken(tokenAddress, account) {
  const end_point = "https://api.panora.exchange/swap";
  const params = {
    chainId: 1,
    fromTokenAddress: "0x1::aptos_coin::AptosCoin",
    toTokenAddress: tokenAddress,
    fromTokenAmount: 1,
    toWalletAddress: account.accountAddress.toString(),
    slippagePercentage: 0,
    integratorFeePercentage: 0,
  };

  const headers = {
    Accept: "application/json",
    "x-api-key": "a4^KV_EaTf4MW#ZdvgGKX#HUD^3IFEAOV_kzpIE^3BQGA8pDnrkT7JcIy#HNlLGi",
  };

  try {
    const response = await axios.post(end_point, "", { params, headers });
    return response.data;
  } catch (error) {
    console.error("Error while swapping.***********************", error);
    return { error: error.data };
  }
}

module.exports = {
  createAccount,
  deriveAccount,
  getAptosBalance,
  getTokenList,
  swapTokens,
  verifyToken,
};
