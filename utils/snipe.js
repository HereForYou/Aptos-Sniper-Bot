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
    if (data.error) {
      // ctx.reply("Sorry, something went wrong while swapping tokens!");
      let replyMessage = "Sorry, something went wrong!";
      if (data.error.error_code === "account_not_found") {
        replyMessage =
          "Sorry, to use newly generated wallet, you must top up that one to let network verify your account.";
      }
      ctx.reply(replyMessage);
    } else {
      clearInterval(time);
      console.log("Snipe is success", data);
      ctx.reply("Snipe is success! Successfully buyed the token.");
    }
    // if (!data.error) {
    //   clearInterval(time);
    // }
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
