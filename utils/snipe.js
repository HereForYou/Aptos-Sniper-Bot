const { swapTokens } = require("./panora");
let time;

const start = (ctx, fromToken, toToken, fromAmount, toWallet, slippage = 0) => {
  console.log("running...");
  time = setInterval(async () => {
    const data = await swapTokens(fromToken, toToken, fromAmount, toWallet, slippage);
    console.log(!!data.error, data);
    // if (data.error) {
      // ctx.reply("There is no such liquidity pool between your token and other token.");
    // }
  }, 5000);
};

const pause = () => {
  clearInterval(time);
};

module.exports = {
  start,
  pause,
};
