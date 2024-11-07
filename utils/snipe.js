const { swapTokens } = require("./panora");
let time;

/**
 * The function to start the snipe
 *
 * Run swapTokens function in every 5000ms
 *
 * @param {Context<Update.CallbackQueryUpdate<CallbackQuery>> & Omit<Context<Update>} ctx
 * @param {string} fromToken
 * @param {string} toToken
 * @param {string} fromAmount
 * @param {string} toWallet
 * @param {string} slippage Optional
 */
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

/**
 * Pause snipe, clear the time interval
 */
const pause = () => {
  clearInterval(time);
};

module.exports = {
  start,
  pause,
};
