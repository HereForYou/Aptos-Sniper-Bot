const { Telegraf, session } = require("telegraf");
const { isValidWallet, removeTags, combineTextArray, isNumber, isInteger } = require("./utils/function");
const { createAccount, deriveAccount, getAptosBalance } = require("./utils/aptos-web3");
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
} = require("./models/markup.model");
const { chainsText, mainText, generateWalletText, addSnipeText } = require("./models/text.model");

//========================================================= Create new bot -> username: @aptos_snipe_bot
const BOT_TOKEN = process.env.BOT_TOKEN;
const bot = new Telegraf(BOT_TOKEN);
const wallets = []; //=========================== variable to save all wallets
const tokens = []; //============================ variable to save all tokens
let isSnipeRunning = false; //=================== variable to save whether or not bot is running

bot.use(session());
bot.use((ctx, next) => {
  if (!ctx.session) {
    ctx.session = {};
  }
  return next();
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
      });
      await newUser.save();
    }
    currentMessage = await ctx.reply(mainText, mainMarkUp);
  } catch (error) {}
});

/**
 * When the user inputs /help command in bot
 *
 * It returns all available commands to user
 */
bot.command("help", (ctx) => {
  ctx.reply(`You can control me by sending these commands:\n\n/start - start the bot\n`);
});

/**
 * When the user inputs unavailable commands in bot
 */
bot.command((ctx) => {
  ctx.reply("⚠️ Sorry, I don't recognize that command.\nPlease use /help to see the available commands.");
});

//=====================================================================================================|
//                            The part to listen the messages from bot                                 |
//=====================================================================================================|

/**
 * Interact with the bot with the text message
 *
 * Called when the user import and delete wallet and add new token
 */
bot.on("text", async (ctx) => {
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

    user.accounts.push(account);
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
  } else if (ctx.session.prevState === "Add Token") {
    tokens.push(text);
    const replyMessage = combineTextArray(tokens, "Token Address");
    await ctx.reply("✅ Successfully added\n\n" + replyMessage, {
      parse_mode: "HTML",
      reply_markup: addSnipeMarkUp.reply_markup,
    });
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
  } else {
    if (text.startsWith("/"))
      ctx.reply("⚠️ I don't recognize that command.\nPlease use /help to see available commands.");
  }
});

//=====================================================================================================|
//                             The part to declare the actions                                         |
//=====================================================================================================|

/**
 * Catch the action when the user clicks the '💰 Wallets' call_back button
 */
bot.action("Wallets", async (ctx) => {
  await ctx.editMessageText("Select target chain:", walletsMarkUp);
  ctx.session.prevState = "Wallets";
});

/**
 * Catch the action when the user clicks the 'Wallets -> Aptos -> ActiveWallet' call_back button
 */
bot.action("ActiveWallet", async (ctx) => {
  await ctx.reply("Input the wallet number you want to activate");
  ctx.session.prevState = "ActiveWallet";
});

/**
 * Catch the action when the user clicks the '⚙️ Chains' call_back button
 */
bot.action("Chains", (ctx) => {
  ctx.reply(chainsText, chainsMarkUp);
  ctx.session.previousCommand = "Chains";
});

/**
 * Catch the action when the user clicks the '⚙️ Call Channels' call_back button
 */
bot.action("Channel", async (ctx) => {
  await ctx.editMessageText("Select target chain:", callChannelMarkUp);

  ctx.session.previousCommand = "Channel";
});

/**
 * Catch the action when the user clicks the '⚙️ Auto Snipe' call_back button
 */
bot.action("AutoSnipe", async (ctx) => {
  await ctx.editMessageText("Select target chain:", autoSnipeMarkUp);
  ctx.session.prevState = "AutoSnipe";
});

/**
 * Catch the action when the user clicks the 'Export' call_back button
 */
bot.action("Export", async (ctx) => {
  const chatId = ctx.chat.id;
  let accountMessage = [];
  let replyMessage = "";
  const user = await User.findOne({ tgId: chatId });
  const addresses = user.accounts.map((account, index) => {
    if (account.active) active = index;
    return account.accountAddress;
  });
  if (ctx.session.exported) {
    replyMessage = combineTextArray(addresses, "Address", active);
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
});

/**
 * Catch the action when the user clicks the '⚙️ Auto Snipe -> APTOS -> Generate Wallet' call_back button
 */
bot.action("GenerateWallet", async (ctx) => {
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
    });
    await user.save();

    replyMessage = generateWalletText(account.accountAddress, account.privateKey, account.publicKey);
  }
  await ctx.editMessageText(replyMessage, {
    parse_mode: "HTML",
    reply_markup: { inline_keyboard: [[{ text: "Return", callback_data: "Return" }]] },
  });

  ctx.session.previousCommand = "GenerateWallet";
});

/**
 * Catch the action when the user clicks the '⚙️ Auto Snipe -> APTOS or ⚙️ Wallets -> APTOS ' call_back button
 *
 * Navigate to other page according to the value of ctx.session.prevState
 */
bot.action("APTOS", async (ctx) => {
  const chatId = ctx.chat.id;
  ctx.session.chain = "APTOS";
  let active = 0;
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
    console.log(accountAddresses);
    let replyMessage = combineTextArray(accountAddresses, "Address", active);
    await ctx.editMessageText(replyMessage, {
      parse_mode: "HTML",
      reply_markup: manageWalletMarkUp().reply_markup,
    });
  }
});

/**
 * Catch the action when the user clicks the '⚙️ Auto Snipe -> APTOS -> ⚙️ Config || ⚙️ Wallets -> APTOS -> ⚙️ Config ' call_back button
 *
 * If there is no wallet, it returns this message '❌...'
 */
bot.action("Config", async (ctx) => {
  const chatId = ctx.chat.id;
  const user = await User.findOne({ tgId: chatId });
  // if (tokens.length === 0 || wallets.length === 0) {
  if (user.accounts.length === 0) {
    await ctx.reply("❌ You don't have a wallet. Generate or connect one to continue.", genConWalletMarkUp("Return"));
    return;
  }
  await ctx.editMessageText(mainText, mainMarkUp);

  ctx.session.previousCommand = "AutoSnipe";
});

/**
 * Catch the action when the user clicks the Add Snipe call_back button
 *
 * If snipe is already started, it returns this text message '❌ Sorry, snipe is already started.'
 * If there is no wallet, it navigates to noWallet page
 * Otherwise it navigates to start and pause snipe page
 */
bot.action("AddSnipe", async (ctx) => {
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
  if (tokens.length === 0) {
    ctx.reply("Which token address you would like to snipe?");
    ctx.session.prevState = "Add Token";
    return;
  }
  await ctx.editMessageText(addSnipeText(combineTextArray(tokens, "Token Address")), {
    parse_mode: "HTML",
    reply_markup: addSnipeMarkUp.reply_markup,
  });

  ctx.session.previousCommand = "AutoSnipe";
});

/**
 * Catch the action when the user clicks the Close call_back button
 * Delete the current message
 */
bot.action("Close", (ctx) => {
  ctx.deleteMessage();
});

/**
 * Catch the action when the user click Return call_back button
 * Edit the current message into start message (the response message when '/start' command)
 */
bot.action("Return", async (ctx) => {
  await ctx.editMessageText(mainText, {
    reply_markup: mainMarkUp.reply_markup,
  });
});

/**
 * Catch the action when the user click Connect Wallet call_back button
 */
bot.action("ConnectWallet", (ctx) => {
  ctx.reply("Okay. Please input the private key of your wallet you want to connect.");
  ctx.session.prevState = "ConnectWallet";
});

/**
 * Catch the action when the user click delete call_back button
 */
bot.action("DisconnectWallet", async (ctx) => {
  const chatId = ctx.chat.id;
  const user = await User.findOne({ tgId: chatId });
  if (user.accounts.length === 0) {
    ctx.reply("⚠️ There is no wallet!");
    return;
  }
  ctx.reply("Okay. Please input the wallet address you want to delete.");
  ctx.session.prevState = "DisconnectWallet";
});

/**
 * Catch the action when the user click tokens call_back button
 */
bot.action("tokens", async (ctx) => {
  const chatId = ctx.chat.id;
  let replyMessage = "";
  let prevMessage = ctx.session.prevMessage;
  try {
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
    console.log(error, prevMessage);
    ctx.reply("🚫 Sorry, something went wrong while sending message.\n Please restart the bot.");
  }
});

/**
 * Catch the action when the user click add call_back button
 */
bot.action("add", (ctx) => {
  ctx.reply("Okay. Please input the token address you want to add.");
  ctx.session.previousCommand = "add";
});

/**
 * Catch the action when the user click start snipe call_back button
 */
bot.action("Start", async (ctx) => {
  const chatId = ctx.chat.id;
  const user = await User.findOne({ tgId: chatId });

  if (ctx.session.isSnipeRunning) {
    ctx.reply("🚫 Sorry, snipe is already started.");
    return;
  }
  if (tokens.length === 0 || user.accounts.length === 0) {
    ctx.reply("🚫 Sorry, there is no token or wallet for swapping.");
    return;
  }

  start(ctx, "0x1::aptos_coin::AptosCoin", tokens[0], 1, user.accounts[0]);
  ctx.session.isSnipeRunning = true;
  ctx.reply("Snipe is running...");
});

/**
 * Catch the action when the user click pause snipe call_back button
 */
bot.action("Pause", (ctx) => {
  if (!ctx.session.isSnipeRunning) {
    ctx.reply("Snipe does not get started.");
    return;
  }
  pause();
  ctx.session.isSnipeRunning = false;
  ctx.reply("Snipe is paused.");
});

// const commands = [
//   { command: "/start", description: "Start Aptos Snipe Bot" },
//   { command: "/help", description: "Show all available commands" },
// ];
// bot.telegram.setMyCommands(commands);

/**
 * Launch the bot
 */
bot.launch();
console.log("Bot is running...");
