const { Telegraf, session } = require("telegraf");
const { isValidWallet, combineTextArray, encrypt, decrypt } = require("./utils/function");
const { deriveAccount, verifyToken } = require("./utils/aptos-web3");
const { premiumValidate, userNotFound } = require("./utils/middleware");
const User = require("./models/user.model");
const { startCommand, helpCommand, activateCommand, invalidCommand, setCommands } = require("./command/command");
const { mainMarkUp, addSnipeMarkUp, buyTokenMarkUp, selectWalletForBuyMarkUp } = require("./models/markup.model");

const { actionBuy, actionWallet, actionRefresh, actionTurnToBuyOrSell, actionSell } = require("./action/trade");
const {
  actionWallets,
  actionActivateOrDeactivate,
  actionExportWallet,
  actionGenerateWallet,
  actionConnectWallet,
  actionDisconnectWallet,
} = require("./action/wallets");
const {
  actionAutoSnipe,
  actionAddSnipe,
  actionAddToken,
  actionRemoveToken,
  actionStart,
  actionPause,
} = require("./action/snipe");
const { actionChains, actionClose } = require("./action/chain");
const { actionChannel } = require("./action/channel");
const { actionConfig, actionAPTOS, actionReturn } = require("./action/other");
const { addSnipeText } = require("./models/text.model");

//========================================================= Create new bot -> username: @aptos_snipe_bot
const BOT_TOKEN = process.env.BOT_TOKEN;
const bot = new Telegraf(BOT_TOKEN);

bot.use(session());
bot.use((ctx, next) => {
  try {
    if (!ctx.session) {
      ctx.session = {};
    }
    return next();
  } catch (error) {
    console.error(error);
  }
});

//=====================================================================================================|
//                                 The part to declare the commands                                    |
//=====================================================================================================|

/**
 * When the user inputs /start command in bot
 */
bot.command("start", startCommand);
// bot.command("start", async (ctx) => {
//   console.log(
//     "Aptos balance: ",
//     await getAccountBalanceByTokenSymbol("0xc175d297b1743ff847e05609b7dac5ac72df8232fa5c4ea4cfc6877ab0de6fd7")
//   );
// });

/**
 * When the user inputs /help command in bot
 *
 * It returns all available commands to user
 */
bot.command("help", helpCommand);

/**
 * When the user inputs /activate command in bot
 */
bot.command("activate", userNotFound, activateCommand);

/**
 * When the user inputs unavailable commands in bot
 */
bot.command(invalidCommand);

//=====================================================================================================|
//                            The part to listen the messages from bot                                 |
//=====================================================================================================|

/**
 * Interact with the bot with the text message
 *
 * Called when the user input some text in bot not commands
 */
bot.on("text", userNotFound, async (ctx) => {
  try {
    const text = ctx.message.text;
    const chatId = ctx.chat.id;

    const user = await User.findOne({ tgId: chatId });
    if (!user) {
      ctx.reply("🚫 User not found!");
      return;
    }
    ctx.deleteMessage();
    const addresses = user.accounts.map((account) => account.accountAddress);
    const prevState = ctx.session.prevState;

    //========================================================= The part to handle wallet will be imported
    if (prevState === "ConnectWallet") {
      // If the wallet is invalid
      if (!isValidWallet(text)) {
        ctx.reply("⚠️ Invalid private key! Please input the valid private key.");
        return;
      }

      const account = await deriveAccount(text);
      if (account.error) {
        console.log("🚫 Something went wrong while deriving account using privateKey:", error);
        ctx.reply("🚫 Something went wrong while deriving account using privateKey.");
        return;
      }

      if (addresses.includes(account.accountAddress.toString())) {
        ctx.reply("🚫 This wallet already exists.");
        return;
      }
      account.privateKey = encrypt(account.privateKey.toString()).encryptedData;

      user.accounts.push({ ...account, active: user.accounts.length === 0 ? true : false });
      await user.save();

      await ctx.reply(
        "✅ The wallet is successfully imported\n\n" +
          "<b>address</b> : <code>" +
          account.accountAddress +
          "</code>\n<b>privateKey</b> : <code>" +
          decrypt(account.privateKey) +
          "</code>\n<b>publicKey</b> : <code>" +
          account.publicKey +
          "</code>",
        mainMarkUp.reply_markup
      );
      ctx.session.prevState = "ConnectWallet";
      //======================================================= The part to handle deleting wallet
    } else if (prevState === "DisconnectWallet") {
      const index = addresses.indexOf(text);
      if (index === -1) {
        ctx.reply("⚠️ There is no such wallet.\nPlease check again the wallet is existed.");
        return;
      }
      user.accounts.splice(index, 1);
      await user.save();
      await ctx.reply("✅ Successfully deleted", mainMarkUp);
      ctx.session.prevState = "";
      //======================================================= The part to handle adding new token
    } else if (prevState === "RemoveToken") {
      if (!user.tokens.includes(text)) {
        await ctx.reply("⚠️ That token does not exist. Please input token address existed in your token addresses.");
        return;
      }
      const indexOf = user.tokens.indexOf(text);
      user.tokens.splice(indexOf, 1);
      await user.save();
      const replyMessage = combineTextArray(user.tokens, "Token Address");
      await ctx.reply("✅ Successfully removed\n\n" + replyMessage, addSnipeMarkUp);
      ctx.session.prevState = "AutoSnipe";
    } else if (prevState === "ActivateWallet" || prevState === "DeactivateWallet") {
      if (!isValidWallet(text)) {
        ctx.reply("Invalid Wallet address. Retry with valid wallet address.");
        return;
      }
      if (!addresses.includes(text)) {
        ctx.reply("That wallet does not exist! Retry with the wallet address you have with this bot.");
        return;
      }
      const active = user.accounts.find((acc) => acc.accountAddress === text).active;
      if ((active && prevState === "ActivateWallet") || (!active && prevState === "DeactivateWallet")) {
        ctx.reply(`That wallet is already ${prevState === "ActivateWallet" ? "active" : "inactive"}!`);
        return;
      }
      user.accounts.find((acc) => acc.accountAddress === text).active = !active;
      await user.save();
      await ctx.reply(
        `✅ That wallet is successfully ${prevState === "ActivateWallet" ? "activated" : "deactivated"}!`,
        mainMarkUp
      );
      ctx.session.prevState = "Wallets";
    } else if (prevState === "InputBuyAmount") {
      const accountAddresses = [];
      const active = [];
      user.accounts.map((acc, index) => {
        acc.active && active.push(index);
        accountAddresses.push(acc.accountAddress);
      });
      let replyMessage = combineTextArray(accountAddresses, "Wallet", active);
      ctx.reply(replyMessage, selectWalletForBuyMarkUp(user.accounts));
      ctx.session.prevState = "actionBuy";
      ctx.session.buyAmount = text;
    } else if (prevState === "AddToken") {
      if (user.accounts.length === 0) {
        ctx.reply("You have no account. Please import or generate wallet!");
        return;
      }
      if (user.accounts.filter((acc) => acc.active).length === 0) {
        ctx.reply("You have no activated account. Please activate at least one wallet!");
        return;
      }
      if (text === "0x1::aptos_coin::AptosCoin") {
        ctx.reply("Please enter the address different from APT.");
        return;
      }
      ctx.session.toToken = text;
      ctx.session.prevState = "AddAddressForSnipe";
      ctx.reply("Add wallet address you wanna use for snipe.");
    } else if (prevState === "AddAddressForSnipe") {
      ctx.session.snipeAccountAddress = text;
      if (user.accounts.filter((account) => account.accountAddress === text).length === 0) {
        ctx.reply("That wallet does not exist.");
        return;
      }
      if (!user.accounts.find((account) => account.accountAddress === text).active) {
        ctx.reply("Choose the active wallet.");
        return;
      }
      if (
        user.snipes.filter((snipe) => snipe.address === ctx.session.toToken && snipe.accountAddress === text).length > 0
      ) {
        ctx.reply(addSnipeText(text), addSnipeMarkUp);
        return;
      }
      const newSnipe = {
        address: ctx.session.toToken,
        accountAddress: text,
      };
      user.snipes.push(newSnipe);
      await user.save();
      ctx.reply(addSnipeText(text), addSnipeMarkUp);
    } else {
      if (text.startsWith("/")) {
        ctx.reply("⚠️ I don't recognize that command.\nPlease use /help to see available commands.");
      } else {
        if (user.accounts.length === 0) {
          ctx.reply("You have no account. Please import or generate wallet!");
          return;
        }
        if (user.accounts.filter((acc) => acc.active).length === 0) {
          ctx.reply("You have no activated account. Please activate at least one wallet!");
          return;
        }
        if (text === "0x1::aptos_coin::AptosCoin") {
          ctx.reply("Please enter the address different from APT.");
          return;
        }
        const data = await verifyToken(
          text,
          user.accounts.find((acc) => acc.active)
        );
        if (data?.error) {
          ctx.reply("❌ " + data?.error);
          return;
        }
        if (!data?.toToken) {
          ctx.reply("Invalid token address. Re-try with valid token address!");
          return;
        }
        const coinName = data.toToken.address.split("::")[2];
        await ctx.reply(
          `${coinName} 🔗 APT
CA: <code>${data.toToken.address}</code>`,
          buyTokenMarkUp
        );
        ctx.session.toToken = text;
        ctx.session.isBuy = true;
      }
    }
  } catch (error) {
    console.error(error);
  }
});

//=====================================================================================================|
//                             The part to declare the actions                                         |
//                                      For Wallets                                                    |
//=====================================================================================================|

/**
 * Catch the action when the user clicks the '💰 Wallets' call_back button
 */
bot.action("Wallets", userNotFound, actionWallets);

/**
 * Catch the action when the user clicks the '💰 Wallets -> Aptos -> ActivateWallet | DeactivateWallet' call_back button
 */
bot.action(/(Activate|Deactivate)Wallet/, userNotFound, actionActivateOrDeactivate);

/**
 * Catch the action when the user clicks the '💰 Wallets -> APTOS -> Export' call_back button
 */
bot.action("Export", userNotFound, actionExportWallet);

/**
 * Catch the action when the user clicks the '⚙️ Auto Snipe | 💰 Wallets -> APTOS -> Generate Wallet' call_back button
 */
bot.action("GenerateWallet", userNotFound, premiumValidate, actionGenerateWallet);

/**
 * Catch the action when the user click '💰 Wallets -> APTOS -> Connect Wallet' call_back button
 */
bot.action("ConnectWallet", userNotFound, actionConnectWallet);

/**
 * Catch the action when the user click '💰 Wallets -> APOTS -> Disconnect Wallet' call_back button
 */
bot.action("DisconnectWallet", userNotFound, actionDisconnectWallet);

//=====================================================================================================|
//                             The part to declare the actions                                         |
//                                       For Chains                                                    |
//=====================================================================================================|

/**
 * Catch the action when the user clicks the '⚙️ Chains' call_back button
 */
bot.action("Chains", userNotFound, actionChains);

/**
 * Catch the action when the user clicks the '⚙️ Chains -> Close' call_back button
 * Delete the current message
 */
bot.action("Close", userNotFound, actionClose);

//=====================================================================================================|
//                             The part to declare the actions                                         |
//                                      For Channel                                                    |
//=====================================================================================================|

/**
 * Catch the action when the user clicks the '⚙️ Call Channels' call_back button
 */
bot.action("Channel", userNotFound, actionChannel);

//=====================================================================================================|
//                             The part to declare the actions                                         |
//                                       For Snipe                                                     |
//=====================================================================================================|

/**
 * Catch the action when the user clicks the '⚙️ Auto Snipe' call_back button
 */
bot.action("AutoSnipe", userNotFound, actionAutoSnipe);

/**
 * Catch the action when the user clicks the '⚙️ Auto Snipe -> Aptos -> Add Snipe' call_back button
 *
 * If snipe is already started, it returns this text message '❌ Sorry, snipe is already started.'
 * If there is no wallet, it navigates to noWallet page
 * Otherwise it navigates to start and pause snipe page
 */
bot.action("AddSnipe", userNotFound, actionAddSnipe);

/**
 * Catch the action when the user click '🎯 Auto Snipe -> APTOS -> ⚙️ Config -> ⚙️ Add Token' call_back button
 */
bot.action("AddToken", userNotFound, actionAddToken);

/**
 * Catch the action when the user click '🎯 Auto Snipe -> APTOS -> ⚙️ Config -> ⚙️ Remove Token ' call_back button
 */
bot.action("RemoveToken", userNotFound, actionRemoveToken);

/**
 * Catch the action when the user click '⚙️ Auto Snipe -> Aptos -> Add Snipe -> Start' call_back button
 */
bot.action("Start", userNotFound, actionStart);

/**
 * Catch the action when the user click '⚙️ Auto Snipe -> Aptos -> Add Snipe -> Pause' call_back button
 */
bot.action("Pause", userNotFound, actionPause);

//=====================================================================================================|
//                               The part to declare the actions                                       |
//                              different according the prevState                                      |
//=====================================================================================================|

/**
 * Catch the action when the user clicks the '⚙️ Auto Snipe | 💰 Wallets -> APTOS ' call_back button
 *
 * Navigate to other page according to the value of ctx.session.prevState
 */
bot.action("APTOS", userNotFound, actionAPTOS);

/**
 * Catch the action when the user clicks the '⚙️ Auto Snipe -> APOTS -> ⚙️ Config' call_back button
 *
 * If there is no wallet, it returns this message '❌...'
 */
bot.action("Config", userNotFound, actionConfig);

/**
 * Catch the action when the user click 'Return' call_back button
 *
 * Edit the current message into start message (the response message when '/start' command)
 */
bot.action("Return", userNotFound, actionReturn);

//=====================================================================================================|
//                             The part to declare the actions                                         |
//                                 For Buy and Sell Token                                              |
//=====================================================================================================|

/**
 * Catch the action when the user clicks the 'After input token address -> Buy*APT' call_back button
 *
 * /^Buy(0\.[1-9]|[1-10]|X)APT$/ Regular expression
 * "Buy0.1APT",
 * "Buy0.2APT",
 * "Buy0.5APT",
 * "Buy1APT",
 * "Buy2APT",
 * "Buy3APT",
 * "buy0.1APT", // Should not match (case-sensitive)
 * "Buy0.10APT" // Should not match
 */
bot.action(/^Buy(0\.[1-9]|[1-10]|X)APT$/, userNotFound, actionBuy);

/**
 * Catch the action when user clicks the 'After enter token addresss -> Buy ↔️ Sell'
 */
bot.action("BuySell", userNotFound, actionTurnToBuyOrSell);

/**
 * Catch the action when the user clicks the 'After input token address -> Buy*APT -> Wallet * -> 100%' call_back button
 */
bot.action(/^Sell\s+(\d{1,3}%|X\s+(APT|Tokens|%)|Max Tx)$/i, userNotFound, actionSell);

/**
 * Catch the action when the user clicks the 'After input token address -> Buy*APT -> Wallet *' call_back button
 *
 * /^Wallet (\d+$|All$)/ Regular expression
 * "Wallet 1",
 * "Wallet 2",
 * "Wallet 123",
 * "Wallet All",
 * "Wallet 1All", Should not match (just All after Wallet)
 * "Wallet 1s", Should not match (must end with number or All)
 */
bot.action(/^Wallet (\d+$|All$)/, userNotFound, actionWallet);

/**
 * Catch the action when the user clicks the 'After input token address -> Buy*APT -> Wallet * -> Refresh' call_back button
 */
bot.action("Refresh", userNotFound, actionRefresh);

//=====================================================================================================|
//                             The part to show all commands used in bot                               |
//=====================================================================================================|

/**
 * Set all commands in menu button
 */
// setCommands(bot);

/**
 * Launch the bot
 */
bot.launch();
console.log("Bot is running...");
