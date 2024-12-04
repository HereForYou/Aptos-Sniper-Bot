// Create wallet using @aptos-labs/ts-sdk node module
const { Aptos, AptosConfig, Network, Account, Ed25519PrivateKey } = require("@aptos-labs/ts-sdk");
const axios = require("axios");
const { decrypt } = require("./function");

const config = new AptosConfig({ network: Network.MAINNET });
const aptos = new Aptos(config);

/**
 * Get the token information using its address
 *
 * @param {string} address The token address
 * @returns Return the information about the token
 */
const getCoinInformation = async (address) => {
  try {
    const tokenAddress = address.split("::")[0];
    const data = await aptos.getAccountResources({ accountAddress: tokenAddress });
    const hairResource = data.find((resource) => resource.type.includes(address));
    return hairResource;
  } catch (error) {
    console.error("Error while getting information: ", error);
  }
};

/**
 * Get balances of multi addresses
 *
 * @param {Array} addresses The addresses to get the balances
 * @returns Return array of balances of addresses
 */
const getAptosBalance = async (addresses) => {
  try {
    const coinsData = await Promise.all(
      addresses.map(async (address) => {
        const coinData = await aptos.getAccountCoinsData({ accountAddress: address });
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
 * Get the balance of wallet address by token symbol
 *
 * @param {string} address The wallet address you want to get balance
 * @param {string} symbol Optional, The symbol you want to get balance
 * @returns
 */
const getAccountBalanceByTokenSymbol = async (address, symbol = "APT") => {
  const coinData = await aptos.getAccountCoinsData({ accountAddress: address });
  const temp = { amount: 100000000 * 10 ** 8 };
  if (symbol === "APT") {
    const coin = coinData.find((coin) => coin.metadata.symbol === symbol && temp.amount > coin.amount);
    if (coin) {
      return coin.amount / 10 ** coin.metadata.decimals;
    }
    return 0;
  } else {
    const coin = coinData.find((coin) => coin.metadata.symbol === symbol);
    if (coin) {
      return coin.amount / 10 ** coin.metadata.decimals;
    }
    return 0;
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
 * @param {string} privateKeyString A private key used to create wallet
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
async function swapTokens(fromToken, toToken, fromAmount, account, symbol, slippage = 10) {
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
    "x-api-key": "wgYQs4!zl84qs@dKA_66irF@a!LvMr05AjgnxZs9hamPrvqre!.gfyZzkAT_+SKd",
  };

  try {
    const response = await axios.post(end_point, "", { params, headers });
    console.log("Response.data ==============", response.data);

    const txParams = response.data.quotes[0].txData;
    const derivedAccount = await deriveAccount(decrypt(account.privateKey.toString()));
    console.log("=============== STEP 1 ===============", derivedAccount.accountAddress.toString());

    const initialAptBalance = await getAccountBalanceByTokenSymbol(derivedAccount.accountAddress.toString());
    const initialTokenBalance = await getAccountBalanceByTokenSymbol(derivedAccount.accountAddress.toString(), symbol);

    const expireTimestamp = Math.floor(Date.now() / 1000) + 30;
    const transaction = await aptos.transaction.build.simple({
      sender: derivedAccount.accountAddress,
      data: {
        function: txParams.function,
        functionArguments: txParams.arguments,
        typeArguments: txParams.type_arguments,
      },
      options: { expireTimestamp: expireTimestamp * 1000, maxGasAmount: 2000 },
    });
    console.log("=============== STEP 2 ===============", transaction);

    const senderAuthenticator = await aptos.transaction.sign({
      signer: derivedAccount,
      transaction,
    });
    console.log("=============== STEP 3 ===============", senderAuthenticator);

    const buyTx = await aptos.transaction.submit.simple({ transaction, senderAuthenticator });
    console.log("=============== STEP 4 ===============");

    const result = await aptos.waitForTransaction({ transactionHash: buyTx.hash });
    console.log("=============== STEP 5 ===============");

    const aptBalance = await getAccountBalanceByTokenSymbol(derivedAccount.accountAddress.toString());
    const tokenBalance = await getAccountBalanceByTokenSymbol(derivedAccount.accountAddress.toString(), symbol);

    let diffFromAmount, diffToAmount;

    if (fromToken === "0x1::aptos_coin::AptosCoin") {
      diffFromAmount = initialAptBalance - aptBalance;
      diffToAmount = tokenBalance - initialTokenBalance;
    } else {
      diffFromAmount = initialTokenBalance - tokenBalance;
      diffToAmount = aptBalance - initialAptBalance;
    }

    if (result.vm_status == "Executed successfully") {
      console.log("=============== STEP 6 ===============");
      return {
        fromTokenPrice: response.data.fromToken.current_price,
        fromTokenAmount: diffFromAmount,
        fromTokenAmountUSD: diffFromAmount * response.data.fromToken.current_price,
        toTokenPrice: response.data.toToken.current_price,
        toTokenAmount: diffToAmount,
        toTokenAmountUSD: diffToAmount * response.data.toToken.current_price,
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
    console.error("Error while swapping.********", account.accountAddress, "========", error, ">>>>>>>>", error?.data);
    let errorMessage = "";
    let errorCode = "";
    if (error?.data?.error_code === "account_not_found") {
      errorMessage = "Sorry, to use the newly generated wallet, you must top up that one.";
      errorCode = error?.data?.error_code;
    }
    // else if (error?.data?.error_code === "vm_error") {
    //   errorMessage = "It seems like network is a bit busy. Please try again later.";
    //   errorCode = error?.data?.error_code;
    // }
    else {
      errorMessage = "Insufficient balance. Before using bot, please top up your wallet!";
      errorCode = "insufficient_balance";
    }
    return { error: errorMessage, errorCode };
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
    "x-api-key": "wgYQs4!zl84qs@dKA_66irF@a!LvMr05AjgnxZs9hamPrvqre!.gfyZzkAT_+SKd",
  };

  try {
    const response = await axios.post(end_point, "", { params, headers });
    return response.data;
  } catch (error) {
    // console.error("Error while verifying the token.************", error.data ?? error.response.data ?? error);
    console.error("Error while verifying the token.************", error);
    return { error: error.data ?? error.response.data.message ?? "Something went wrong!" };
  }
}

module.exports = {
  createAccount,
  deriveAccount,
  getAptosBalance,
  getTokenList,
  swapTokens,
  verifyToken,
  getCoinInformation,
  getAccountBalanceByTokenSymbol,
};
