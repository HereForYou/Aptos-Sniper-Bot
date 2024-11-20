const User = require("../models/user.model");
const { swapTokens, verifyToken } = require("../utils/aptos-web3");
const { buySuccessReplyText } = require("../models/text.model");
const { buySuccessReplyMarkUp, selectWalletForBuyMarkUp } = require("../models/markup.model");
const { combineTextArray, convertMilliseconds } = require("../utils/function");

const actionSellToken = async (ctx) => {
  try {
    ctx.session.boughtPrice = null;
    const prevBoughtAmount = ctx.session.buyAmount;
    const chatId = ctx.chat.id;
    const user = await User.findOne({ tgId: chatId });
    const amount = [...ctx.session.toTokenAmount];
    const accountIndexes = [...ctx.session.accountIndex];
    const fromToken = ctx.session.toToken;

    let replyMessage = "";
    accountIndexes.map(async (accountIndex, index) => {
      const data = await swapTokens(
        fromToken,
        "0x1::aptos_coin::AptosCoin",
        amount[index],
        // 262268,
        user.accounts[accountIndex]
      );
      if (data.error) {
        replyMessage += "Error";
      } else {
        const targetToken = user.tokens.find(
          (token) => token.address === fromToken && token.accountAddress === data.accountAddress
        );
        console.log(targetToken);
        if (targetToken) {
          targetToken.totalUsedAptosAmount -= Number(data.toTokenAmount);
          // targetToken.totalUsedAptosPrice += data.fromTokenPrice;
          targetToken.totalUsedAptosAmountUSD -= Number(data.toTokenAmountUSD);
          targetToken.totalBoughtTokenAmount -= Number(data.fromTokenAmount);
          targetToken.accountAddress = data.accountAddress;
          // targetToken.totalBoughtTokenPrice += data.toTokenPrice;
          targetToken.latestSellDate = Date.now();
        } else {
          user.tokens.push({
            address: fromToken,
            totalUsedAptosAmount: data.fromTokenAmount,
            totalUsedAptosAmountUSD: data.fromTokenAmountUSD,
            totalBoughtTokenAmount: data.toTokenAmount,
            accountAddress: data.accountAddress,
            initialSellDate: Date.now(),
          });
        }
        await user.save(); //toToken.split("::")[2], data.toTokenPrice, pl, 0, data.priceImpact, "APT"
        const initial = (amount[index] * data.fromTokenPrice) / data.toTokenPrice;
        const worth = data.toTokenAmount;
        const pl = (worth / initial) * 100 - 100;
        const pl1 = prevBoughtAmount - data.toTokenAmount;
        replyMessage +=
          `<b>Wallet ${+accountIndex + 1}</b> : \n` +
          buySuccessReplyText({
            symbol: fromToken.split("::")[1],
            price: data.fromTokenPrice,
            pl: pl1,
            timeElapsed: 0,
            priceImpact: data.priceImpact,
            mainTokenSymbol: "APT",
            initial,
            worth,
          });

        if (accountIndexes.length - 1 === index) ctx.reply(replyMessage, buySuccessReplyMarkUp);
      }
    });
  } catch (error) {
    console.log("Error while actionSellToken function in trade.js", error);
    ctx.reply("Something went wrong while selling token.");
  }
};

const actionBuy = async (ctx) => {
  try {
    const chatId = ctx.chat.id;
    const amount = ctx.callbackQuery.data.replace(/(Buy|APT)/g, "");
    ctx.session.prevState = "BuyToken";
    ctx.session.buyAmount = amount;
    const user = await User.findOne({ tgId: chatId });
    const accountAddresses = [];
    const active = [];
    user.accounts.map((acc, index) => {
      acc.active && active.push(index);
      accountAddresses.push(acc.accountAddress);
    });
    let replyMessage = combineTextArray(accountAddresses, "Wallet", active);
    ctx.reply(replyMessage, selectWalletForBuyMarkUp(user.accounts));
  } catch (error) {
    console.error("Error while actionBuy function in trade.js: ", error);
    ctx.reply("Something went wrong while buying.");
  }
};

const actionRefresh = async (ctx) => {
  try {
    const chatId = ctx.chat.id;
    const user = await User.findOne({ tgId: chatId });
    const toToken = ctx.session.toToken;
    const toTokenAmount = [...ctx.session.toTokenAmount];
    const accountIndexes = [...ctx.session.accountIndex];
    console.log("toToken", toTokenAmount);

    const token = user.tokens.find((token) => token.address === toToken);
    console.log("accountAddress", token.accountAddress);
    const data = await verifyToken(toToken, user.accounts[accountIndexes[0]]);
    console.log("---------------", data);

    let replyMessage = "";
    accountIndexes.map(async (accountIndex, index) => {
      const accountAddress = user.accounts[accountIndex].accountAddress;
      const targetToken = user.tokens.find(
        (token) => token.address === toToken && token.accountAddress === accountAddress
      );
      console.log("targetToken>>>", targetToken);
      const pl =
        ((targetToken.totalBoughtTokenAmount * data.toToken.current_price) /
          (targetToken.totalUsedAptosAmount * data.fromToken.current_price)) *
          100 -
        100;
      console.log("pl", pl);
      const timeElapsed = Date.now() - token.latestBuyDate;
      replyMessage +=
        `<b>Wallet${+accountIndex + 1}</b> : \n` +
        buySuccessReplyText({
          symbol: toToken.split("::")[2],
          price: data.toToken.current_price,
          pl,
          timeElapsed: convertMilliseconds(timeElapsed),
          priceImpact: data.quotes[0].priceImpact,
          mainTokenSymbol: "APT",
          initial: targetToken.totalUsedAptosAmount,
          worth: (targetToken.totalBoughtTokenAmount * data.toToken.current_price) / data.fromToken.current_price,
          boughtPrice: ctx.session.boughtPrice ?? 0,
          spentAmount: ctx.session.buyAmount,
        });
      if (accountIndexes.length - 1 === index) ctx.editMessageText(replyMessage, buySuccessReplyMarkUp);
    });
  } catch (error) {
    console.log(error);
  }
};

const actionWallet = async (ctx) => {
  try {
    const chatId = ctx.chat.id;
    const toToken = ctx.session.toToken;
    const amount = ctx.session.buyAmount;
    const sufix = ctx.callbackQuery.data.split(" ")[1];
    const accountIndexes = [];
    let replyMessage = "";
    ctx.session.toTokenAmount = [];
    ctx.session.accountIndex = [];

    if (!toToken) {
      await ctx.reply("Input the token address you wanna buy.");
      ctx.session.prevState = "AddToken";
      return;
    }

    const user = await User.findOne({ tgId: chatId });
    if (sufix !== "All") {
      accountIndexes.push(sufix);
      if (!user.accounts[sufix].active) {
        ctx.reply("This wallet is not active. Choose active wallet or activate this wallet.");
        return;
      }
    } else {
      user.accounts.map((account, index) => {
        if (!account.active) {
          replyMessage += replyMessage === "" ? "<b>Wallet " + (index + 1) : "</b>, <b>Wallet</b> " + (index + 1);
        } else {
          accountIndexes.push(index);
        }
      });
    }
    replyMessage += replyMessage === "" ? "" : "</b>: Not activated! \n\n";

    accountIndexes.map(async (accountIndex, index) => {
      const data = await swapTokens("0x1::aptos_coin::AptosCoin", toToken, amount, user.accounts[accountIndex]);
      // const data = await swapTokens("0x1::aptos_coin::AptosCoin", toToken, 0.03, user.accounts[accountIndex]);
      const prefix = `<b>Wallet ${+accountIndex + 1}</b> : `;
      if (data?.error) {
        console.log("wallet", data.error);
        if (data?.error?.error_code === "account_not_found") {
          replyMessage +=
            prefix +
            "Sorry, to use the newly generated wallet, you must top up that one to let network verify your account.\n\n";
        } else {
          // ctx.reply(replyMessage);
          replyMessage += prefix + "Insufficient balance. Before using bot, please top up your wallet!\n\n";
        }
      } else {
        let targetToken = user.tokens.find(
          (token) => token.address === toToken && token.accountAddress === data.accountAddress
        );
        console.log("targetToken", targetToken);
        if (targetToken) {
          targetToken.totalUsedAptosAmount += Number(data.fromTokenAmount);
          // targetToken.totalUsedAptosPrice += data.fromTokenPrice;
          targetToken.totalUsedAptosAmountUSD += Number(data.fromTokenAmountUSD);
          targetToken.totalBoughtTokenAmount += Number(data.toTokenAmount);
          targetToken.accountAddress = data.accountAddress;
          // targetToken.totalBoughtTokenPrice += data.toTokenPrice;
          targetToken.latestBuyDate = Date.now();
        } else {
          user.tokens.push({
            address: toToken,
            totalUsedAptosAmount: data.fromTokenAmount,
            totalUsedAptosAmountUSD: data.fromTokenAmountUSD,
            totalBoughtTokenAmount: data.toTokenAmount,
            accountAddress: data.accountAddress,
            initialBuyDate: Date.now(),
          });
        }
        const boughtPrice = data.fromTokenAmount / data.toTokenAmount;
        ctx.session.boughtPrice = boughtPrice;
        console.log("==================befor save");
        await user.save(); //toToken.split("::")[2], data.toTokenPrice, pl, 0, data.priceImpact, "APT"
        console.log("==================after save");
        targetToken = user.tokens.find(
          (token) => token.address === toToken && token.accountAddress === data.accountAddress
        );
        // const boughtAmountInAPT = (targetToken.totalBoughtTokenAmount * data.toTokenPrice) / data.fromTokenPrice;
        const pl =
          ((targetToken.totalBoughtTokenAmount * data.toTokenPrice) /
            data.fromTokenPrice /
            targetToken.totalUsedAptosAmount) *
            100 -
          100;
        console.log("==================befor reply", data);
        replyMessage +=
          prefix +
          "Success\n" +
          buySuccessReplyText({
            symbol: toToken.split("::")[2],
            price: data.toTokenPrice,
            pl,
            timeElapsed: 0,
            priceImpact: data.priceImpact,
            mainTokenSymbol: "APT",
            initial: targetToken.totalUsedAptosAmount,
            worth: (targetToken.totalBoughtTokenAmount * data.toTokenPrice) / data.fromTokenPrice,
            boughtPrice,
            spentAmount: amount,
          });
        console.log("==================after reply");
        ctx.session.toTokenAmount.push(data.toTokenAmount);
        ctx.session.accountIndex.push(accountIndex);
      }
      if (index === accountIndexes.length - 1) {
        if (ctx.session.accountIndex.length !== 0) ctx.reply(replyMessage, buySuccessReplyMarkUp);
        else ctx.reply(replyMessage, { parse_mode: "HTML" });
        console.log(ctx.session.toTokenAmount, "===\n", ctx.session.accountIndex);
      }
    });
  } catch (error) {
    console.error(error);
  }
};

module.exports = { actionSellToken, actionBuy, actionRefresh, actionWallet };
