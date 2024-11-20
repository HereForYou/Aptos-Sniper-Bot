const User = require("../models/user.model");
const { walletsMarkUp } = require("../models/markup.model");
const { getAptosBalance, createAccount } = require("../utils/aptos-web3");
const { combineTextArray } = require("../utils/function");
const { manageWalletMarkUp } = require("../models/markup.model");
const { generateWalletText } = require("../models/text.model");

const actionWallets = async (ctx) => {
  try {
    await ctx.editMessageText("Select target chain:", walletsMarkUp);
    ctx.session.prevState = "Wallets";
  } catch (error) {
    console.error(error);
  }
};

const actionActivateOrDeactivate = async (ctx) => {
  try {
    const action = ctx.callbackQuery.data;
    await ctx.reply("Input the wallet address you want to " + action.replace("Wallet", "").toLowerCase());
    ctx.session.prevState = action;
  } catch (error) {
    console.error(error);
  }
};

const actionExportWallet = async (ctx) => {
  try {
    const chatId = ctx.chat.id;
    let replyMessage = "";
    let active = [];
    const user = await User.findOne({ tgId: chatId });
    const addresses = user.accounts.map((account, index) => {
      if (account.active) active.push(index);
      return account.accountAddress;
    });
    if (ctx.session.exported) {
      const coins = await getAptosBalance(addresses);
      replyMessage = combineTextArray(addresses, "Address", active, coins);
      ctx.session.exported = false;
    } else {
      ctx.session.exported = true;
      replyMessage = "The information about your wallets:\n" + combineTextArray(user.accounts, "", [], null, true);
    }

    await ctx.editMessageText(replyMessage, manageWalletMarkUp(ctx.session.exported));
  } catch (error) {
    console.error(error);
  }
};

const actionGenerateWallet = async (ctx) => {
  try {
    let replyMessage = "";
    const chatId = ctx.chat.id;
    const account = await createAccount();
    if (account.error) {
      //===== if there is some errors
      replyMessage = "🚫 Sorry, Something went wrong while generating wallet.";
    } else {
      const user = await User.findOne({ tgId: chatId });
      if (!user) {
        ctx.reply("🚫 User not found!");
        return;
      }
      user.accounts.push({
        accountAddress: account.accountAddress.toString(),
        privateKey: account.privateKey.toString(),
        publicKey: account.publicKey.toString(),
        active: user.accounts.length === 0 ? true : false,
      });
      await user.save();

      replyMessage = generateWalletText(account.accountAddress, account.privateKey, account.publicKey);
    }
    await ctx.editMessageText(replyMessage, {
      parse_mode: "HTML",
      reply_markup: { inline_keyboard: [[{ text: "Return", callback_data: "Return" }]] },
    });

    ctx.session.previousCommand = "GenerateWallet";
  } catch (error) {
    console.error(error);
  }
};

const actionConnectWallet = (ctx) => {
  try {
    ctx.reply("Okay. Please input the private key of your wallet you want to connect.");
    ctx.session.prevState = "ConnectWallet";
  } catch (error) {
    console.error(error);
  }
};

const actionDisconnectWallet = async (ctx) => {
  try {
    const chatId = ctx.chat.id;
    const user = await User.findOne({ tgId: chatId });
    if (user.accounts.length === 0) {
      ctx.reply("⚠️ There is no wallet!");
      return;
    }
    ctx.reply("Okay. Please input the wallet address you want to delete.");
    ctx.session.prevState = "DisconnectWallet";
  } catch (error) {
    console.error(error);
  }
};

module.exports = {
  actionWallets,
  actionActivateOrDeactivate,
  actionExportWallet,
  actionGenerateWallet,
  actionConnectWallet,
  actionDisconnectWallet,
};
