const { swapTokens } = require("./aptos-web3");
let time = {};

/**
 * The function to start the snipe
 * Run swapTokens function in every 5000ms
 *
 * @param {Context<Update.CallbackQueryUpdate<CallbackQuery>> & Omit<Context<Update>} ctx
 * @param {string} fromToken The token you want to consume for toToken
 * @param {string} toToken The token you want to get by consuming the fromToken
 * @param {string} fromAmount The amount of fromToken
 * @param {object} account The address of getting toToken and consuming fromToken
 * @param {string} slippage Optional
 */
const start = (ctx, fromToken, toToken, fromAmount, account, slippage = 0) => {
  console.log("running...");
  time[ctx.chat.id] = setInterval(async () => {
    const data = await swapTokens(fromToken, toToken, fromAmount, account, slippage);
    if (data?.error) {
      // ctx.reply("Sorry, something went wrong while swapping tokens!");
      let replyMessage = "Sorry, something went wrong!";
      if (data?.error?.error_code === "account_not_found") {
        replyMessage =
          "Sorry, to use newly generated wallet, you must top up that one to let network verify your account.";
        clearInterval(time);
      }
      ctx.reply(replyMessage);
    } else {
      clearInterval(time);
      console.log("Snipe is success", data);
      ctx.reply("Snipe is success! Successfully buyed the token.");
    }
  }, 10000);
};

/**
 * Pause snipe, clear the time interval
 */
const pause = () => {
  clearInterval(time[ctx.chat.id]);
  delete time[ctx.chat.id];
};

module.exports = {
  start,
  pause,
};
