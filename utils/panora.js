const axios = require("axios");

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

async function swapTokens(fromToken, toToken, fromAmount, toWallet, slippage = 0) {
  const end_point = "https://api.panora.exchange/swap";
  const params = {
    chainId: 1,
    fromTokenAddress: fromToken,
    toTokenAddress: toToken,
    fromTokenAmount: fromAmount,
    toWalletAddress: toWallet,
    slippagePercentage: slippage,
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
    console.log("Error while swapping.");
    return { error: "Error while swapping111." };
  }
}

module.exports = { getTokenList, swapTokens };
