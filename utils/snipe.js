const { Context } = require("telegraf");
const { swapTokens, verifyToken } = require("./aptos-web3");
let time = {};

/**
 * The function to start the snipe
 * Run swapTokens function in every 5000ms
 *
 * @param {Context} ctx
 * @param {string} fromToken The token you want to consume for toToken
 * @param {string} toToken The token you want to get by consuming the fromToken
 * @param {string} fromAmount The amount of fromToken
 * @param {object} account The address of getting toToken and consuming fromToken
 * @param {string} slippage Optional
 */
const start = (ctx, fromToken, toToken, fromAmount, account, symbol, slippage = 0) => {
  console.log("running...");
  time[ctx.chat.id] = setInterval(async () => {
    const data = await verifyToken(toToken, account);
    if (data?.error) {
      // ctx.reply("Sorry, something went wrong while swapping tokens!");
      console.log("ErrorCode: ", data.errorCode);
      let replyMessage = data.error;
      if (data?.errorCode === "account_not_found") {
        console.log("trade.js 318 row: ", data?.error);
        replyMessage += data.error + "\n\n";
        clearInterval(time);
      }
      if (data.error === "Invalid toTokenAddress") {
        ctx.reply(`There is no liqudity with APT and <code>${toToken}</code>`, { parse_mode: "HTML" });
      } else {
        ctx.reply(replyMessage);
      }
    } else {
      clearInterval(time[ctx.chat.id]);
      console.log("Snipe is success", data);
      const data = await swapTokens(fromToken, toToken, fromAmount, account, symbol, slippage);
      if (data?.error) {
        ctx.reply(`Something went wrong while swapping between APT and ${symbol}`);
        return;
      }
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
