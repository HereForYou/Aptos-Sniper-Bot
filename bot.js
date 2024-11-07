const { Telegraf, session } = require("telegraf");
const { isValidWallet, removeTags } = require("./utils/function");
const { createAccount, deriveAccount } = require("./utils/aptos-web3");
const { start, pause } = require("./utils/snipe");
const {
  markUp,
  mainMarkUp,
  chainsMarkUp,
  walletsMarkUp,
  callChannelMarkUp,
  autoSnipeMarkUp,
  manageSnipeMarkUp,
  manageWalletMarkUp,
  addSnipeMarkUp,
} = require("./models/markup.model");
const { chainsText, mainText, generateWalletText, addSnipeText } = require("./models/text.model");

//========================================================= Create new bot -> username: @aptos_snipe_bot
const BOT_TOKEN = process.env.BOT_TOKEN;
const bot = new Telegraf(BOT_TOKEN);
const wallets = []; //=========================== variable to save all wallets
const accounts = []; //========================== variable to save all accounts
const tokens = []; //============================ variable to save all tokens
let isSnipeRunning = false; //=================== variable to save whether or not bot is running
let prevMessage, currentMessage, chatId; //===================== variable to handle editing the initial message

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

//============================================================================= Handle the start command
bot.command("start", async (ctx) => {
  chatId = ctx.chat.id;
  console.log(chatId);
  currentMessage = await ctx.reply(mainText, mainMarkUp);
});

//============================================================================= Handle the help command
bot.command("help", (ctx) => {
  ctx.reply(`You can control me by sending these commands:\n\n/start - start the bot\n`);
});

//============================================================================= Handle unrecognized commands
bot.command((ctx) => {
  ctx.reply("⚠️ Sorry, I don't recognize that command.\nPlease use /help to see the available commands.");
});

//=====================================================================================================|
//                            The part to listen the messages from bot                                 |
//=====================================================================================================|

//============================================================================== Handle the text message
bot.on("text", async (ctx) => {
  const text = ctx.message.text;

  //========================================================= The part to handle wallet will be imported
  if (ctx.session.previousCommand === "import") {
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

    accounts.push(account);
    wallets.push(account.address);
    console.log("wallets: ", wallets);
    chatId = ctx.chat.id;
    prevMessage = await ctx.reply(
      "<b>address</b> : <code>" +
        account.address +
        "</code>\n<b>privateKey</b> : <code>" +
        account.privateKey +
        "</code>\n<b>publicKey</b> : <code>" +
        account.publicKey +
        "</code>",
      { parse_mode: "HTML", reply_markup: markUp.reply_markup }
    );
    ctx.session.previousCommand = "";
    //======================================================= The part to handle deleting wallet
  } else if (ctx.session.previousCommand === "delete") {
    const index = wallets.indexOf(text);
    if (index === -1) {
      ctx.reply("⚠️ There is no such wallet.\nPlease check again the wallet is existed.");
      return;
    }
    wallets.splice(index, 1);
    chatId = ctx.chat.id;
    prevMessage = await ctx.reply("✅ Successfully deleted", markUp);
    ctx.session.previousCommand = "";
    //======================================================= The part to handle adding new token
  } else if (ctx.session.previousCommand === "add") {
    // If the the token address is invalid
    if (!isValidWallet(text)) {
      ctx.reply("⚠️ Invalid token address! Please input the valid token address.");
      return;
    }

    tokens.push(text);
    chatId = ctx.chat.id;
    prevMessage = await ctx.reply("✅ Successfully added", markUp);
  } else {
    if (text.startsWith("/"))
      ctx.reply("⚠️ I don't recognize that command.\nPlease use /help to see available commands.");
  }
});

//=====================================================================================================|
//                             The part to declare the actions                                         |
//=====================================================================================================|

//============================================================================== When the user clicks the wallets button
bot.action("Wallets", async (ctx) => {
  await ctx.editMessageText("Select target chain:", walletsMarkUp);
  ctx.session.prevState = "Wallets";
  // let replyMessage = "";
  // try {
  //   if (wallets.length === 0) {
  //     replyMessage = "⚠️ There is no wallet";
  //   } else {
  //     replyMessage = "These are your wallets.\n<code>" + wallets.join("</code>\n<code>") + "</code>";
  //   }

  //   if (!prevMessage) {
  //     chatId = ctx.chat.id;
  //     prevMessage = await ctx.reply(replyMessage, { parse_mode: "HTML", reply_markup: markUp.reply_markup });
  //     return;
  //   }

  //   if (removeTags(replyMessage) === removeTags(prevMessage.text)) {
  //     return;
  //   }

  //   prevMessage = await ctx.telegram.editMessageText(chatId, prevMessage.message_id, undefined, replyMessage, {
  //     parse_mode: "HTML",
  //     reply_markup: markUp.reply_markup,
  //   });
  // } catch (error) {
  //   console.log(error, prevMessage);
  //   ctx.reply("🚫 Sorry, something went wrong while sending message.\n Please restart the bot.");
  // }
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
 * Catch the action when the user clicks the '⚙️ Auto Snipe -> APTOS -> Generate Wallet' call_back button
 */
bot.action("GenerateWallet", async (ctx) => {
  let replyMessage = "";
  const account = await createAccount();
  if (account.error) {
    //===== if there is some errors
    replyMessage = "🚫 Sorry, Something went wrong while generating wallet.";
  } else {
    accounts.push(account);
    wallets.push(account.address);
    replyMessage = generateWalletText(account.address, account.privateKey, account.publicKey);
  }
  await ctx.editMessageText(replyMessage, {
    parse_mode: "HTML",
    reply_markup: { inline_keyboard: [[{ text: "Return", callback_data: "Return" }]] },
  });

  ctx.session.previousCommand = "GenerateWallet";
});

/**
 * Catch the action when the user clicks the '⚙️ Auto Snipe -> APTOS or ⚙️ Wallets -> APTOS ' call_back button
 */
bot.action("APTOS", async (ctx) => {
  ctx.session.chain = "APTOS";
  const prevState = ctx.session.prevState;
  if (prevState === "AutoSnipe") {
    await ctx.editMessageText("Add, remove, and manage snipes!", manageSnipeMarkUp);
  } else if (prevState === "Wallets") {
    if (wallets.length === 0) {
      await ctx.editMessageText("ℹ️ Connect a wallet to show settings.", manageWalletMarkUp("Wallets"));
      return;
    }
    let replyMessage = "Address: <code>" + wallets.join("</code>\nAddress: <code>") + "</code>";
    await ctx.editMessageText(replyMessage, {
      parse_mode: "HTML",
      reply_markup: manageWalletMarkUp("Wallets").reply_markup,
    });
  }
});

//===================================================================== When the user clicks the Config button
bot.action("Config", async (ctx) => {
  // if (tokens.length === 0 || wallets.length === 0) {
  if (wallets.length === 0) {
    currentMessage = await ctx.reply(
      "❌ You don't have a wallet. Generate or connect one to continue.",
      manageWalletMarkUp("Return")
    );
    return;
  }
  await ctx.editMessageText(mainText, mainMarkUp);

  ctx.session.previousCommand = "AutoSnipe";
});

/**
 * Catch the action when the user clicks the Add Snipe call_back button
 * If snipe is already started, it returns this text message '❌ Sorry, snipe is already started.'
 * If there is no wallet, it navigates to noWallet page
 * Otherwise it navigates to start and pause snipe page
 */
bot.action("AddSnipe", async (ctx) => {
  if (isSnipeRunning) {
    ctx.reply("❌ Sorry, snipe is already started.");
    return;
  }
  // if (tokens.length === 0 || wallets.length === 0) {
  if (wallets.length === 0) {
    ctx.reply("❌ You don't have a wallet. Generate or connect one to continue.", manageWalletMarkUp("Return"));
    return;
  }
  await ctx.editMessageText(addSnipeText, addSnipeMarkUp);

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

//===================================================================== When the user clicks the import button
bot.action("import", (ctx) => {
  ctx.reply("Okay. Please input the private key of your wallet you want to import.");
  ctx.session.previousCommand = "import";
});

//===================================================================== When the user clicks the delete button
bot.action("delete", (ctx) => {
  if (wallets.length === 0) {
    ctx.reply("⚠️ There is no wallet!");
    return;
  }
  ctx.reply("Okay. Please input the wallet address you want to delete.");
  ctx.session.previousCommand = "delete";
});

//===================================================================== When the user clicks the create button
bot.action("create", async (ctx) => {
  let replyMessage = "";
  try {
    const account = await createAccount(); // create new account
    if (account.error) {
      //===== if there is some errors
      replyMessage = "🚫 Sorry, Something went wrong while creating account.";
    } else {
      accounts.push(account);
      wallets.push(account.address);
      replyMessage =
        "Done! New wallet is created.\n" +
        "<b>address</b> : <code>" +
        account.address +
        "</code>\n<b>privateKey</b> : <code>" +
        account.privateKey +
        "</code>\n<b>publicKey</b> : <code>" +
        account.publicKey +
        "</code>";
    }

    if (!prevMessage) {
      chatId = ctx.chat.id;
      prevMessage = await ctx.reply(replyMessage, { parse_mode: "HTML", reply_markup: markUp.reply_markup });
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
    ctx.reply("🚫 Sorry, something went wrong while sending message.\nPlease restart the bot.");
  }
});

//============================================================================== When the user clicks the your tokens button
bot.action("tokens", async (ctx) => {
  let replyMessage = "";
  try {
    if (tokens.length === 0) {
      replyMessage = "⚠️ There is no tokens";
    } else {
      replyMessage = "These are your tokens.\n<code>" + tokens.join("</code>\n<code>") + "</code>";
    }

    if (!prevMessage) {
      chatId = ctx.chat.id;
      prevMessage = await ctx.reply(replyMessage, { parse_mode: "HTML", reply_markup: markUp.reply_markup });
      return;
    }

    if (removeTags(replyMessage) === removeTags(prevMessage.text)) {
      return;
    }

    prevMessage = await ctx.telegram.editMessageText(chatId, prevMessage.message_id, undefined, replyMessage, {
      parse_mode: "HTML",
      reply_markup: markUp.reply_markup,
    });
  } catch (error) {
    console.log(error, prevMessage);
    ctx.reply("🚫 Sorry, something went wrong while sending message.\n Please restart the bot.");
  }
});

//===================================================================== When the user clicks the add token button
bot.action("add", (ctx) => {
  ctx.reply("Okay. Please input the token address you want to add.");
  ctx.session.previousCommand = "add";
});

bot.action("start", (ctx) => {
  if (isSnipeRunning) {
    ctx.reply("🚫 Sorry, snipe is already started.");
    return;
  }
  if (tokens.length === 0 || wallets.length === 0) {
    ctx.reply("🚫 Sorry, there is no token or wallet for swapping.");
    return;
  }
  console.log(tokens[0]);

  start(ctx, tokens[0], "0x1::aptos_coin::AptosCoin", 1, wallets[0]);
  isSnipeRunning = true;
  ctx.reply("Snipe is running...");
});

bot.action("pause", (ctx) => {
  if (!isSnipeRunning) {
    ctx.reply("Snipe does not get started.");
    return;
  }
  pause();
  isSnipeRunning = false;
  ctx.reply("Snipe is paused.");
});

const commands = [
  { command: "/start", description: "Start Aptos Snipe Bot" },
  { command: "/help", description: "Show all available commands" },
];
// bot.telegram.setMyCommands(commands);

//===================================================================== Launch the bot
bot.launch();
console.log("Bot is running...");
