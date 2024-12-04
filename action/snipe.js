const { autoSnipeMarkUp, genConWalletMarkUp } = require("../models/markup.model");
const { start, pause } = require("../utils/snipe");
const User = require("../models/user.model");

const actionAutoSnipe = async (ctx) => {
  try {
    await ctx.editMessageText("Select target chain:", autoSnipeMarkUp);
    ctx.session.prevState = "AutoSnipe";
  } catch (error) {
    console.error(error);
  }
};

const actionAddSnipe = async (ctx) => {
  try {
    const chatId = ctx.chat.id;
    const user = await User.findOne({ tgId: chatId });

    if (ctx.session.isSnipeRunning) {
      ctx.reply("❌ Sorry, snipe is already started.");
      return;
    }
    if (user.accounts.length === 0) {
      ctx.reply("❌ You don't have a wallet. Generate or connect one to continue.", genConWalletMarkUp("Return"));
      return;
    }
    ctx.reply("Which token address you would like to snipe?");
    ctx.session.prevState = "AddToken";
  } catch (error) {
    console.error(error);
  }
};

const actionAddToken = async (ctx) => {
  try {
    ctx.reply("Which token address you would like to snipe?");
    ctx.session.prevState = "AddToken";
  } catch (error) {
    console.error(error);
  }
};

const actionRemoveToken = async (ctx) => {
  try {
    ctx.reply("Which token address you would like to remove?");
    ctx.session.prevState = "RemoveToken";
  } catch (error) {
    console.error(error);
  }
};

const actionStart = async (ctx) => {
  try {
    if (ctx.session.isSnipeRunning) {
      ctx.reply("🚫 Sorry, snipe is already started.");
      return;
    }

    const snipeToken = ctx.session.toToken;
    const snipeAddress = ctx.session.snipeAccountAddress;

    console.log(ctx.session.toToken, ctx.session.snipeAccountAddress);

    const chatId = ctx.chat.id;
    const user = await User.findOne({ tgId: chatId });

    const account = user.accounts.find((account) => account.accountAddress === snipeAddress);
    console.log("Address accout : ", account);

    if (!account) {
      ctx.reply("That address does not exist");
    }

    // if (user.tokens.length === 0 || user.accounts.length === 0) {
    //   ctx.reply("🚫 Sorry, there is no token or wallet for snipe.");
    //   return;
    // }
    // const activeAccs = user.accounts.filter((account) => account.active === true);
    // if (activeAccs.length === 0) {
    //   ctx.reply("🚫 Sorry, you have no active account. Activate at least one account.");
    //   return;
    // }

    start(ctx, "0x1::aptos_coin::AptosCoin", snipeToken, 0.1, account);
    ctx.session.isSnipeRunning = true;
    ctx.reply("Snipe is running...");
  } catch (error) {
    console.log(error);
  }
};

const actionPause = (ctx) => {
  try {
    if (!ctx.session.isSnipeRunning) {
      ctx.reply("Snipe does not get started.");
      return;
    }
    pause(ctx);
    ctx.session.isSnipeRunning = false;
    ctx.reply("Snipe is paused.");
  } catch (error) {
    console.log(error);
  }
};

module.exports = { actionAutoSnipe, actionAddSnipe, actionAddToken, actionRemoveToken, actionStart, actionPause };
