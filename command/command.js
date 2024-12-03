const User = require("../models/user.model");
const { mainText } = require("../models/text.model");
const { mainMarkUp, genConWalletMarkUp, manageWalletMarkUp } = require("../models/markup.model");
const { getAptosBalance } = require("../utils/aptos-web3");
const { combineTextArray } = require("../utils/function");

const startCommand = async (ctx) => {
  try {
    const chatId = ctx.chat.id;

    // if (chatId === 6155262701 || chatId === 1873690277) {
    //   ctx.reply("It's very streesful to work with you. Disaster!!!");
    //   return;
    // }
    console.log(chatId);
    const user = await User.findOne({ tgId: chatId });
    if (!user) {
      const newUser = new User({
        tgId: chatId,
        userName: ctx.chat.username | "default",
      });
      await newUser.save();
    }
    // await User.updateMany({}, { $set: { premium: false } }); // update all usres
    currentMessage = await ctx.reply(mainText(), mainMarkUp);
    ctx.session.prevState = "";
  } catch (error) {
    console.error(error);
  }
};

const helpCommand = (ctx) => {
  try {
    ctx.reply(
      `You can control me by sending these commands:\n\n/start - start the bot\n\n/activate - activate you account\n`
    );
  } catch (error) {
    console.error(error);
  }
};

const activateCommand = async (ctx) => {
  try {
    const chatId = ctx.chat.id;
    let active = [];
    const user = await User.findOne({ tgId: chatId });
    if (!user) {
      ctx.reply("🚫 User not found!");
      return;
    }
    if (user.accounts.length === 0) {
      await ctx.reply("ℹ️ Connect a wallet to show settings.", genConWalletMarkUp("Wallets"));
      return;
    }

    // Map over accounts to get an array of account addresses
    const accountAddresses = user.accounts.map((account, index) => {
      if (account.active) active.push(index);
      return account.accountAddress;
    });
    const coins = await getAptosBalance(accountAddresses);
    let replyMessage = combineTextArray(accountAddresses, "Address", active, coins);
    await ctx.reply(replyMessage, manageWalletMarkUp());
  } catch (error) {
    console.error(error);
  }
};

const invalidCommand = (ctx) => {
  try {
    ctx.reply("⚠️ Sorry, I don't recognize that command.\nPlease use /help to see the available commands.");
  } catch (error) {
    console.error(error);
  }
};

const setCommands = async (bot) => {
  const commands = [
    { command: "/start", description: "Start Aptos Snipe Bot" },
    { command: "/activate", description: "Activate your account" },
    { command: "/help", description: "Show all available commands" },
  ];
  try {
    const result = await bot.telegram.setMyCommands(commands);
    if (result === false) {
      console.log("Return is false. Something went wrong while setting commands!");
    }
  } catch (error) {
    console.log("Something went wrong while setting commands!");
  }
};

module.exports = { startCommand, helpCommand, activateCommand, invalidCommand, setCommands };
