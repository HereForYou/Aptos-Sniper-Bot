const { Telegraf, session } = require("telegraf");
const { isValidWallet, removeTags, combineTextArray, isNumber, isInteger } = require("./utils/function");
const {
  createAccount,
  deriveAccount,
  getAptosBalance,
  verifyToken,
  getTokenInformation,
  swapTokens,
} = require("./utils/aptos-web3");
const { start, pause } = require("./utils/snipe");
const User = require("./models/user.model");
const {
  markUp,
  mainMarkUp,
  chainsMarkUp,
  walletsMarkUp,
  callChannelMarkUp,
  autoSnipeMarkUp,
  manageSnipeMarkUp,
  genConWalletMarkUp,
  manageWalletMarkUp,
  addSnipeMarkUp,
  autoSnipeConfMarkUp,
  buyTokenMarkUp,
} = require("./models/markup.model");
const { chainsText, mainText, generateWalletText, addSnipeText, autoSnipeConfigText } = require("./models/text.model");

//========================================================= Create new bot -> username: @aptos_snipe_bot
const BOT_TOKEN = process.env.BOT_TOKEN;
const bot = new Telegraf(BOT_TOKEN);
const wallets = []; //=========================== variable to save all wallets
const tokens = []; //============================ variable to save all tokens
let isSnipeRunning = false; //=================== variable to save whether or not bot is running

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
bot.command("start", async (ctx) => {
  try {
    const chatId = ctx.chat.id;
    console.log(chatId);
    const user = await User.findOne({ tgId: chatId });
    if (!user) {
      const newUser = new User({
        tgId: chatId,
        userName: ctx.chat.username,
      });
      await newUser.save();
    }
    if (!user?.userName) {
      user.userName = ctx.chat.username;
      await user.save();
    }
    currentMessage = await ctx.reply(mainText, mainMarkUp);
  } catch (error) {
    console.error(error);
  }
});

/**
 * When the user inputs /help command in bot
 *
 * It returns all available commands to user
 */
bot.command("help", (ctx) => {
  try {
    ctx.reply(
      `You can control me by sending these commands:\n\n/start - start the bot\n\n/activate - activate you account\n`
    );
  } catch (error) {
    console.error(error);
  }
});

/**
 * When the user inputs unavailable commands in bot
 */
bot.command("activate", async (ctx) => {
  try {
    const chatId = ctx.chat.id;
    let active = -1;
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
      if (account.active) active = index;
      return account.accountAddress;
    });
    const coins = await getAptosBalance(accountAddresses);
    let replyMessage = combineTextArray(accountAddresses, "Address", active, coins);
    await ctx.reply(replyMessage, {
      parse_mode: "HTML",
      reply_markup: manageWalletMarkUp().reply_markup,
    });
  } catch (error) {
    console.error(error);
  }
});

/**
 * When the user inputs unavailable commands in bot
 */
bot.command((ctx) => {
  try {
    ctx.reply("⚠️ Sorry, I don't recognize that command.\nPlease use /help to see the available commands.");
  } catch (error) {
    console.error(error);
  }
});

//=====================================================================================================|
//                            The part to listen the messages from bot                                 |
//=====================================================================================================|

/**
 * Interact with the bot with the text message
 *
 * Called when the user clicks the button
 */
bot.on("text", async (ctx) => {
  try {
    const text = ctx.message.text;
    const chatId = ctx.chat.id;

    const user = await User.findOne({ tgId: chatId });
    if (!user) {
      ctx.reply("🚫 User not found!");
      return;
    }
    const addresses = user.accounts.map((account) => account.accountAddress);

    //========================================================= The part to handle wallet will be imported
    if (ctx.session.prevState === "ConnectWallet") {
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

      user.accounts.push({ ...account, active: user.accounts.length === 0 ? true : false });
      await user.save();

      await ctx.reply(
        "✅ The wallet is successfully imported\n\n" +
          "<b>address</b> : <code>" +
          account.accountAddress +
          "</code>\n<b>privateKey</b> : <code>" +
          account.privateKey +
          "</code>\n<b>publicKey</b> : <code>" +
          account.publicKey +
          "</code>",
        { parse_mode: "HTML", reply_markup: mainMarkUp.reply_markup }
      );
      ctx.session.prevState = "ConnectWallet";
      //======================================================= The part to handle deleting wallet
    } else if (ctx.session.prevState === "DisconnectWallet") {
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
    } else if (ctx.session.prevState === "AddToken") {
      if (user.tokens.includes(text)) {
        await ctx.reply("⚠️ That token is already added. Please input another token address.");
        return;
      }
      user.tokens.push(text);
      await user.save();
      const replyMessage = combineTextArray(user.tokens, "Token Address");
      await ctx.reply("✅ Successfully added\n\n" + replyMessage, {
        parse_mode: "HTML",
        reply_markup: addSnipeMarkUp.reply_markup,
      });
      ctx.session.prevState = "AutoSnipe";
    } else if (ctx.session.prevState === "RemoveToken") {
      if (!user.tokens.includes(text)) {
        await ctx.reply("⚠️ That token does not exist. Please input token address existed in your token addresses.");
        return;
      }
      const indexOf = user.tokens.indexOf(text);
      user.tokens.splice(indexOf, 1);
      await user.save();
      const replyMessage = combineTextArray(user.tokens, "Token Address");
      await ctx.reply("✅ Successfully removed\n\n" + replyMessage, {
        parse_mode: "HTML",
        reply_markup: addSnipeMarkUp.reply_markup,
      });
      ctx.session.prevState = "AutoSnipe";
    } else if (ctx.session.prevState === "ActiveWallet") {
      let replyMessage = "";
      if (!isInteger(text)) {
        ctx.reply("You must input integer!");
        return;
      }
      if (text > addresses.length) {
        ctx.reply("The number of wallet you want to activate must be less than the length of wallets!");
        return;
      }
      for (let index = 0; index < user.accounts.length; index++) {
        if (index == text - 1) {
          if (user.accounts[index].active) {
            replyMessage = "That wallet is already active.";
          } else {
            user.accounts[index].active = true;
            replyMessage = "✅ That wallet is successfully activated!";
          }
        } else if (user.accounts[index].active) {
          user.accounts[index].active = false;
        }
      }
      await user.save();
      await ctx.reply(replyMessage, mainMarkUp);
      ctx.session.prevState = "";
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
        const data = await verifyToken(
          text,
          user.accounts.find((acc) => acc.active)
        );
        if (!data?.toToken) {
          ctx.reply("Invalid token address. Re-try with valid token address!");
          return;
        }
        const coinAddress = data.toToken.address.split("::")[0];
        // const coinSymbol = data.toToken.address.split("::")[1];
        const coinName = data.toToken.address.split("::")[2];
        await ctx.reply(
          `${coinName} 🔗 APT
CA: <code>${coinAddress}</code>`,
          { parse_mode: "HTML", reply_markup: buyTokenMarkUp.reply_markup }
        );
        ctx.session.toToken = text;
      }
    }
  } catch (error) {
    console.error(error);
  }
});

//=====================================================================================================|
//                             The part to declare the actions                                         |
//=====================================================================================================|

/**
 * Catch the action when the user clicks the '💰 Wallets' call_back button
 */
bot.action("Wallets", async (ctx) => {
  try {
    await ctx.editMessageText("Select target chain:", walletsMarkUp);
    ctx.session.prevState = "Wallets";
  } catch (error) {
    console.error(error);
  }
});

/**
 * Catch the action when the user clicks the '💰 Wallets -> Aptos -> ActiveWallet' call_back button
 */
bot.action("ActiveWallet", async (ctx) => {
  try {
    await ctx.reply("Input the wallet number you want to activate");
    ctx.session.prevState = "ActiveWallet";
  } catch (error) {
    console.error(error);
  }
});

/**
 * Catch the action when the user clicks the '💰 Wallets -> APTOS -> Export' call_back button
 */
bot.action("Export", async (ctx) => {
  try {
    const chatId = ctx.chat.id;
    let accountMessage = [];
    let replyMessage = "";
    let active = 0;
    const user = await User.findOne({ tgId: chatId });
    const addresses = user.accounts.map((account, index) => {
      if (account.active) active = index;
      return account.accountAddress;
    });
    if (ctx.session.exported) {
      const coins = await getAptosBalance(addresses);
      replyMessage = combineTextArray(addresses, "Address", active, coins);
      ctx.session.exported = false;
    } else {
      for (let i = 0; i < user.accounts.length; i++) {
        accountMessage.push(
          "\n<b>Address</b>: <code>" +
            user.accounts[i].accountAddress +
            "</code>\n" +
            "<b>Private Key</b>: <code>" +
            user.accounts[i].privateKey +
            "</code>\n" +
            "<b>Public Key</b>: <code>" +
            user.accounts[i].publicKey +
            "</code>"
        );
      }
      ctx.session.exported = true;
      replyMessage = "The information about your wallets:\n" + accountMessage.join("\n");
    }

    await ctx.editMessageText(replyMessage, {
      parse_mode: "HTML",
      reply_markup: manageWalletMarkUp(ctx.session.exported).reply_markup,
    });
  } catch (error) {
    console.error(error);
  }
});

/**
 * Catch the action when the user clicks the '⚙️ Auto Snipe | 💰 Wallets -> APTOS -> Generate Wallet' call_back button
 */
bot.action("GenerateWallet", async (ctx) => {
  try {
    let replyMessage = "";
    const account = await createAccount();
    const chatId = ctx.chat.id;
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
});

/**
 * Catch the action when the user click '💰 Wallets -> APTOS -> Connect Wallet' call_back button
 */
bot.action("ConnectWallet", (ctx) => {
  try {
    ctx.reply("Okay. Please input the private key of your wallet you want to connect.");
    ctx.session.prevState = "ConnectWallet";
  } catch (error) {
    console.error(error);
  }
});

/**
 * Catch the action when the user click '💰 Wallets -> APOTS -> Disconnect Wallet' call_back button
 */
bot.action("DisconnectWallet", async (ctx) => {
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
});

/**
 * Catch the action when the user clicks the '⚙️ Chains' call_back button
 */
bot.action("Chains", (ctx) => {
  try {
    ctx.reply(chainsText, chainsMarkUp);
    ctx.session.previousCommand = "Chains";
  } catch (error) {
    console.error(error);
  }
});

/**
 * Catch the action when the user clicks the '⚙️ Chains -> Close' call_back button
 * Delete the current message
 */
bot.action("Close", (ctx) => {
  try {
    ctx.deleteMessage();
  } catch (error) {
    console.error(error);
  }
});

/**
 * Catch the action when the user clicks the '⚙️ Call Channels' call_back button
 */
bot.action("Channel", async (ctx) => {
  try {
    await ctx.editMessageText("Select target chain:", callChannelMarkUp);
    ctx.session.previousCommand = "Channel";
  } catch (error) {
    console.error(error);
  }
});

/**
 * Catch the action when the user clicks the '⚙️ Auto Snipe' call_back button
 */
bot.action("AutoSnipe", async (ctx) => {
  try {
    await ctx.editMessageText("Select target chain:", autoSnipeMarkUp);
    ctx.session.prevState = "AutoSnipe";
  } catch (error) {
    console.error(error);
  }
});

/**
 * Catch the action when the user clicks the '⚙️ Auto Snipe | 💰 Wallets -> APTOS ' call_back button
 *
 * Navigate to other page according to the value of ctx.session.prevState
 */
bot.action("APTOS", async (ctx) => {
  try {
    const chatId = ctx.chat.id;
    ctx.session.chain = "APTOS";
    let active = -1;
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
        if (account.active) active = index;
        return account.accountAddress;
      });
      const coins = await getAptosBalance(accountAddresses);
      let replyMessage = combineTextArray(accountAddresses, "Address", active, coins);
      await ctx.editMessageText(replyMessage, {
        parse_mode: "HTML",
        reply_markup: manageWalletMarkUp().reply_markup,
      });
    }
  } catch (error) {
    console.error(error);
  }
});

/**
 * Catch the action when the user clicks the '⚙️ Auto Snipe | 💰 Wallets -> APOTS -> ⚙️ Config' call_back button
 *
 * If there is no wallet, it returns this message '❌...'
 */
bot.action("Config", async (ctx) => {
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
      await ctx.editMessageText(mainText, mainMarkUp);
    }
  } catch (error) {
    console.error(error);
  }
});

/**
 * Catch the action when the user clicks the '⚙️ Auto Snipe -> Aptos -> Add Snipe' call_back button
 *
 * If snipe is already started, it returns this text message '❌ Sorry, snipe is already started.'
 * If there is no wallet, it navigates to noWallet page
 * Otherwise it navigates to start and pause snipe page
 */
bot.action("AddSnipe", async (ctx) => {
  try {
    const chatId = ctx.chat.id;
    const user = await User.findOne({ tgId: chatId });

    if (isSnipeRunning) {
      ctx.reply("❌ Sorry, snipe is already started.");
      return;
    }
    // if (tokens.length === 0 || wallets.length === 0) {
    if (user.accounts.length === 0) {
      ctx.reply("❌ You don't have a wallet. Generate or connect one to continue.", genConWalletMarkUp("Return"));
      return;
    }
    if (user.tokens.length === 0) {
      ctx.reply("Which token address you would like to snipe?");
      ctx.session.prevState = "AddToken";
      return;
    }
    await ctx.editMessageText(addSnipeText(combineTextArray(user.tokens, "Token Address")), {
      parse_mode: "HTML",
      reply_markup: addSnipeMarkUp.reply_markup,
    });
  } catch (error) {
    console.error(error);
  }
});

/**
 * Catch the action when the user click '🎯 Auto Snipe -> APTOS -> ⚙️ Config -> ⚙️ Add Token' call_back button
 */
bot.action("AddToken", async (ctx) => {
  try {
    ctx.reply("Which token address you would like to snipe?");
    ctx.session.prevState = "AddToken";
  } catch (error) {
    console.error(error);
  }
});

/**
 * Catch the action when the user click '🎯 Auto Snipe -> APTOS -> ⚙️ Config -> ⚙️ Remove Token' call_back button
 */
bot.action("RemoveToken", async (ctx) => {
  try {
    ctx.reply("Which token address you would like to remove?");
    ctx.session.prevState = "RemoveToken";
  } catch (error) {
    console.error(error);
  }
});

/**
 * Catch the action when the user click 'Return' call_back button
 * Edit the current message into start message (the response message when '/start' command)
 */
bot.action("Return", async (ctx) => {
  try {
    await ctx.editMessageText(mainText, {
      reply_markup: mainMarkUp.reply_markup,
    });
  } catch (error) {
    console.error(error);
  }
});

/**
 * Catch the action when the user click tokens call_back button
 */
bot.action("tokens", async (ctx) => {
  try {
    const chatId = ctx.chat.id;
    let replyMessage = "";
    let prevMessage = ctx.session.prevMessage;
    if (tokens.length === 0) {
      replyMessage = "⚠️ There is no tokens";
    } else {
      replyMessage = "These are your tokens.\n<code>" + tokens.join("</code>\n<code>") + "</code>";
    }

    if (!prevMessage) {
      await ctx.reply(replyMessage, { parse_mode: "HTML", reply_markup: markUp.reply_markup });
      return;
    }

    if (removeTags(replyMessage) === removeTags(prevMessage.text)) {
      return;
    }

    await ctx.telegram.editMessageText(chatId, prevMessage.message_id, undefined, replyMessage, {
      parse_mode: "HTML",
      reply_markup: markUp.reply_markup,
    });
  } catch (error) {
    console.log(error);
    ctx.reply("🚫 Sorry, something went wrong while sending message.\n Please restart the bot.");
  }
});

/**
 * Catch the action when the user click add call_back button
 */
bot.action("add", (ctx) => {
  try {
    ctx.reply("Okay. Please input the token address you want to add.");
    ctx.session.previousCommand = "add";
  } catch (error) {
    console.log(error);
  }
});

/**
 * Catch the action when the user click 'Start' call_back button
 */
bot.action("Start", async (ctx) => {
  try {
    if (ctx.session.isSnipeRunning) {
      ctx.reply("🚫 Sorry, snipe is already started.");
      return;
    }

    const chatId = ctx.chat.id;
    const user = await User.findOne({ tgId: chatId });

    if (user.tokens.length === 0 || user.accounts.length === 0) {
      ctx.reply("🚫 Sorry, there is no token or wallet for swapping.");
      return;
    }
    const activeAccs = user.accounts.filter((account) => account.active === true);
    if (activeAccs.length === 0) {
      ctx.reply("🚫 Sorry, you have no active account. Activate at least one account.");
      return;
    }

    start(ctx, "0x1::aptos_coin::AptosCoin", user.tokens[0], 0.1, activeAccs[0]);
    ctx.session.isSnipeRunning = true;
    ctx.reply("Snipe is running...");
  } catch (error) {
    console.log(error);
  }
});

/**
 * Catch the action when the user click 'Pause' call_back button
 */
bot.action("Pause", (ctx) => {
  try {
    if (!ctx.session.isSnipeRunning) {
      ctx.reply("Snipe does not get started.");
      return;
    }
    pause();
    ctx.session.isSnipeRunning = false;
    ctx.reply("Snipe is paused.");
  } catch (error) {
    console.log(error);
  }
});

bot.action(/^Buy(0\.[1-9]|[1-10]|X)APT$/, async (ctx) => {
  const chatId = ctx.chat.id;
  const amount = ctx.callbackQuery.data.replace(/(Buy|APT)/g, "");
  console.log(amount);
  const toToken = ctx.session.toToken;
  if (!toToken) {
    await ctx.reply("Input the token address you wanna buy.");
    return;
  }
  if (amount === "X") {
    await ctx.reply("Input the amount of APT you wanna use to buy.");
    ctx.session.prevState = "BuyToken";
    return;
  }
  const user = await User.findOne({ tgId: chatId });
  const activeAcc = await user.accounts.find((acc) => acc.active);
  const data = await swapTokens("0x1::aptos_coin::AptosCoin", toToken, amount, activeAcc);
  if (data?.error) {
    let replyMessage = data?.error;
    if (data?.error?.error_code === "account_not_found") {
      replyMessage =
        "Sorry, to use the newly generated wallet, you must top up that one to let network verify your account.";
    }
    ctx.reply(replyMessage);
  } else {
    ctx.reply(`$${data.toTokenAmount} ${toToken.split("::")[2]} Successfully buyed using $${amount} APT.`);
  }
});

// const setCommands = async () => {
//   const commands = [
//     { command: "/start", description: "Start Aptos Snipe Bot" },
//     { command: "/activate", description: "Activate your account" },
//     { command: "/help", description: "Show all available commands" },
//   ];
//   try {
//     const result = await bot.telegram.setMyCommands(commands);
//     if (result === false) {
//       console.log("Return is false. Something went wrong while setting commands!");
//     }
//   } catch (error) {
//     console.log("Something went wrong while setting commands!");
//   }
// };
// setCommands();

/**
 * Launch the bot
 */
bot.launch();
console.log("Bot is running...");
