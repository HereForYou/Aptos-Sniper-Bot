const { swapTokens } = require("./aptos-web3");
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
 * @param {object} account
 * @param {string} slippage Optional
 */
const start = (ctx, fromToken, toToken, fromAmount, account, slippage = 0) => {
  console.log("running...");
  time = setInterval(async () => {
    const data = await swapTokens(fromToken, toToken, fromAmount, account, slippage);
    // if (data.error) {
    //   // ctx.reply("Sorry, something went wrong while swapping tokens!");
    //   console.log("Sorry, something went wrong while swapping tokens!");
    // } else {
    //   clearInterval(time);
    // }
    if (!data.error) {
      clearInterval(time);
    }
  }, 10000);
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
