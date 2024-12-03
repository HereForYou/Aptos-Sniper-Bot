const User = require("../models/user.model");
const { walletsMarkUp } = require("../models/markup.model");
const { getAptosBalance, createAccount } = require("../utils/aptos-web3");
const { combineTextArray, encrypt } = require("../utils/function");
const { manageWalletMarkUp } = require("../models/markup.model");
const { generateWalletText } = require("../models/text.model");

/**
 * When user clicks 'Wallets' callback button on first page
 *
 * @param {Context} ctx
 */
const actionWallets = async (ctx) => {
  try {
    await ctx.editMessageText("Select target chain:", walletsMarkUp);
    ctx.session.prevState = "Wallets";
  } catch (error) {
    console.error(error);
  }
};

/**
 * When user clicks 'Activate | Deactivate' callback button on Wallets management page.
 *
 * @param {Context} ctx
 */
const actionActivateOrDeactivate = async (ctx) => {
  try {
    const action = ctx.callbackQuery.data;
    await ctx.reply("Input the wallet address you want to " + action.replace("Wallet", "").toLowerCase());
    ctx.session.prevState = action;
  } catch (error) {
    console.error(error);
  }
};

/**
 * When user clicks the 'Export | Hide' callback button on Wallets management page.
 *
 * @param {Context} ctx
 */
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

/**
 * When user clicks the 'Generage' callback button on Wallets management page.
 *
 * @param {Context} ctx
 * @returns
 */
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
        privateKey: encrypt(account.privateKey.toString()).encryptedData,
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

/**
 * When user clicks the 'Import' callback button on Wallets management page.
 *
 * @param {Context} ctx
 * @returns
 */
const actionConnectWallet = (ctx) => {
  try {
    ctx.reply("Okay. Please input the private key of your wallet you want to connect.");
    ctx.session.prevState = "ConnectWallet";
  } catch (error) {
    console.error(error);
  }
};

/**
 * When user clicks the 'Disconnect' callback button on Wallets management page.
 *
 * @param {Context} ctx
 * @returns
 */
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
