const User = require("../models/user.model");
const {
  genConWalletMarkUp,
  autoSnipeConfMarkUp,
  mainMarkUp,
  manageSnipeMarkUp,
  manageWalletMarkUp,
} = require("../models/markup.model");
const { mainText, autoSnipeConfigText } = require("../models/text.model");
const { combineTextArray } = require("../utils/function");
const { getAptosBalance } = require("../utils/aptos-web3");

const actionConfig = async (ctx) => {
  try {
    const chatId = ctx.chat.id;
    const user = await User.findOne({ tgId: chatId });
    console.log(ctx.session.prevState);
    if (ctx.session.prevState === "AutoSnipe") {
      await ctx.editMessageText(autoSnipeConfigText, autoSnipeConfMarkUp);
    } else {
      // if (tokens.length === 0 || wallets.length === 0) {
      if (user.accounts.length === 0) {
        await ctx.reply(
          "❌ You don't have a wallet. Generate or connect one to continue.",
          genConWalletMarkUp("Return")
        );
        return;
      }
      await ctx.editMessageText(mainText(), mainMarkUp);
    }
  } catch (error) {
    console.error(error);
  }
};

const actionAPTOS = async (ctx) => {
  try {
    const chatId = ctx.chat.id;
    ctx.session.chain = "APTOS";
    let active = [];
    const prevState = ctx.session.prevState;
    if (prevState === "AutoSnipe") {
      await ctx.editMessageText("Add, remove, and manage snipes!", manageSnipeMarkUp);
    } else if (prevState === "Wallets") {
      const user = await User.findOne({ tgId: chatId });
      if (!user) {
        ctx.reply("🚫 User not found!");
        return;
      }
      if (user.accounts.length === 0) {
        await ctx.editMessageText("ℹ️ Connect a wallet to show settings.", genConWalletMarkUp("Wallets"));
        return;
      }

      // Map over accounts to get an array of account addresses
      const accountAddresses = user.accounts.map((account, index) => {
        if (account.active) active.push(index);
        return account.accountAddress;
      });
      const coins = await getAptosBalance(accountAddresses);
      let replyMessage = combineTextArray(accountAddresses, "Address", active, coins);
      await ctx.editMessageText(replyMessage, manageWalletMarkUp());
    }
  } catch (error) {
    console.error(error);
  }
};

const actionReturn = async (ctx) => {
  try {
    await ctx.editMessageText(mainText(), mainMarkUp);
  } catch (error) {
    console.error(error);
  }
};

module.exports = { actionConfig, actionAPTOS, actionReturn };
