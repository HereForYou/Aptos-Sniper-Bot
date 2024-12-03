const User = require("../models/user.model");
const {
  swapTokens,
  verifyToken,
  getAptosBalance,
  getCoinInformation,
  getAccountBalanceByTokenSymbol,
} = require("../utils/aptos-web3");
const { buySuccessReplyText } = require("../models/text.model");
const {
  buySuccessReplyMarkUp,
  selectWalletForBuyMarkUp,
  sellTokenMarkUp,
  buyTokenMarkUp,
} = require("../models/markup.model");
const { combineTextArray, convertMilliseconds, delay, isNumber } = require("../utils/function");
const { Context } = require("telegraf");

/**
 * Switch between buy and sell part.
 * When user clicks 'Buy ↔️ Sell' callback button.
 *
 * @param {Context} ctx
 */
const actionTurnToBuyOrSell = async (ctx) => {
  try {
    console.log(ctx.session.isBuy, !!ctx.session.isBuy);
    if (ctx.session.isBuy) {
      await ctx.editMessageReplyMarkup(sellTokenMarkUp.reply_markup);
    } else {
      await ctx.editMessageReplyMarkup(buyTokenMarkUp.reply_markup);
    }
    ctx.session.isBuy = !ctx.session.isBuy;
  } catch (error) {
    if (ctx.session.isBuy) {
      await ctx.editMessageReplyMarkup(buyTokenMarkUp.reply_markup);
    } else {
      await ctx.editMessageReplyMarkup(sellTokenMarkUp.reply_markup);
    }
  }
};

/**
 * When user clicks /^Buy(0\.[1-9]|[1-10]|X)APT$/ callback button
 *
 * @param {Context} ctx
 */
const actionBuy = async (ctx) => {
  try {
    const chatId = ctx.chat.id;
    const amount = ctx.callbackQuery.data.replace(/(Buy|APT)/g, "");

    // If user clicks 'Buy X APT' callback button.
    if (amount === "X") {
      ctx.reply("Input the amount!");
      ctx.session.prevState = "InputBuyAmount";
      return;
    }
    const user = await User.findOne({ tgId: chatId });
    const accountAddresses = [];
    const active = [];

    // Get all active accounts and all account addressses
    user.accounts.map((acc, index) => {
      acc.active && active.push(index);
      accountAddresses.push(acc.accountAddress);
    });
    ctx.session.buyAmount = amount;
    let replyMessage = combineTextArray(accountAddresses, "Wallet", active);
    ctx.editMessageText(replyMessage, selectWalletForBuyMarkUp(user.accounts));
    ctx.session.prevState = "actionBuy";
  } catch (error) {
    console.error("Error while actionBuy function in trade.js: ", error);
    ctx.reply("Something went wrong while buying.");
  }
};

/**
 * When callback data is '/^Sell\s+(\d{1,3}%|X\s+(APT|Tokens|%)|Max Tx)$/i'
 *
 * @param {Context} ctx
 */
const actionSell = async (ctx) => {
  try {
    const chatId = ctx.chat.id;
    const user = await User.findOne({ tgId: chatId });
    const accountAddresses = [];
    const active = [];
    user.accounts.map((acc, index) => {
      acc.active && active.push(index);
      accountAddresses.push(acc.accountAddress);
    });
    const amount = ctx.callbackQuery.data.replace(/(Sell|%|\s+)/g, "");
    console.log(amount);

    let replyMessage = "";

    // amount is 25, 50, 75, 100
    if (/\d{1,3}/.test(amount)) {
      ctx.session.sellAmount = amount;
      ctx.session.prevState = "actionSell";
      replyMessage = combineTextArray(accountAddresses, "Wallet", active);
      ctx.editMessageText(replyMessage, selectWalletForBuyMarkUp(user.accounts));
    }
    ctx.session.prevState = "actionSell";
  } catch (error) {
    console.error("Error in trade.js 78 row: ", error);
    ctx.reply("Something went wrong while buying.");
  }
};

/**
 *
 * @param {Context} ctx
 * @returns
 */
const actionRefresh = async (ctx) => {
  let isWaiting = false;
  try {
    const chatId = ctx.chat.id;
    const user = await User.findOne({ tgId: chatId });
    const toToken = ctx.session.toToken ?? user.tokens.length > 0 ? user.tokens[0].address : "";
    const indexes = !!ctx.session.accountIndex
      ? !!ctx.session.accountIndex.length
        ? ctx.session.accountIndex
        : []
      : [];
    const replySells = !!ctx.session.replySell ? (!!ctx.session.replySell.length ? ctx.session.replySell : []) : [];

    if (toToken === "") {
      ctx.reply("Please input token address");
      return;
    }
    if (toToken === "0x1::aptos_coin::AptosCoin") {
      ctx.reply("Please enter an address different from APT.");
      return;
    }
    console.log("toToken", toToken, indexes);

    const toTokenInfor = await getCoinInformation(toToken);
    const toTokenSymbol = toTokenInfor.data.symbol;
    let accounts = [];
    if (indexes.length > 0)
      indexes.map((index) => {
        accounts.push(user.accounts[Number(index)]);
      });
    else
      accounts = user.accounts.filter(
        (account) =>
          account.active &&
          user.tokens.find(
            (token) => token.address === toToken && token.accountAddress === account.accountAddress.toString()
          )
      );

    if (accounts.length === 0) {
      ctx.reply(`There is no user bought this token \n <code>${toToken}</code>`, { parse_mode: "HTML" });
      return;
    }
    console.log("accounts.length", accounts.length);

    let replyMessage = "";
    accounts.map(async (account, index) => {
      while (isWaiting) {
        console.log("Boolean is true, delaying...");
        await delay(1000); // Delay for 1 second
      }
      isWaiting = true;
      console.log("Refresh: ", toToken, account);

      const data = await verifyToken(toToken, account);
      console.log("---------------", data);

      if (data?.error) {
        ctx.reply("❌ " + data?.error);
        isWaiting = false;
        return;
      }

      const targetToken = user.tokens.find(
        (token) => token.address === toToken && token.accountAddress === account.accountAddress.toString()
      );
      console.log("Target TOken: ", targetToken);
      const initial = targetToken.totalUsedAptosAmount;
      const worth =
        (targetToken.totalBoughtTokenAmount * data?.toToken?.current_price) / data?.fromToken?.current_price;
      const soldPrice = Number(data?.toToken?.current_price) / Number(data?.fromToken?.current_price);
      let pl = (soldPrice - targetToken.averageBoughtPrice) * targetToken.totalBoughtTokenAmount;
      const timeElapsed = Date.now() - targetToken.latestBuyDate;

      if (replySells.length > 0) {
        replyMessage +=
          `<b>Wallet${+user.accounts.findIndex((acc) => acc.accountAddress === account.accountAddress) + 1}</b> : \n` +
          buySuccessReplyText({ ...replySells[index], timeElapsed: convertMilliseconds(timeElapsed) });
      } else {
        replyMessage +=
          `<b>Wallet${+user.accounts.findIndex((acc) => acc.accountAddress === account.accountAddress) + 1}</b> : \n` +
          buySuccessReplyText({
            totalBoughtTokenAmount: targetToken.totalBoughtTokenAmount,
            symbol: toTokenSymbol,
            price: data.toToken.current_price,
            pl,
            timeElapsed: convertMilliseconds(timeElapsed),
            priceImpact: data.quotes[0].priceImpact,
            initial: initial,
            worth: worth,
            boughtPrice: ctx.session.boughtPrice ?? data?.toToken?.current_price / data?.fromToken?.current_price,
            spentAmount: initial,
          });
      }

      if (index + 1 === accounts.length) {
        if (replyMessage === "") {
          ctx.reply(`There is no user bought this token \n <code>${toToken}</code>`, { parse_mode: "HTML" });
        } else {
          ctx.editMessageText(replyMessage, buySuccessReplyMarkUp);
        }
      }
      isWaiting = false;
    });
  } catch (error) {
    isWaiting = false;
    console.log(error);
  }
};

/**
 * /^Wallet (\d+$|All$)/
 *
 * @param {Context} ctx
 * @returns
 */
const actionWallet = async (ctx) => {
  let isWaiting = false;
  try {
    const prevState = ctx.session.prevState;
    const chatId = ctx.chat.id;
    const user = await User.findOne({ tgId: chatId });

    const selectedToken = ctx.session.toToken;
    if (!selectedToken) {
      if (prevState === "actionBuy") await ctx.reply("Input the token address you wanna buy.");
      else if (prevState === "actionSell") await ctx.reply("Input the token address you wanna sell.");
      else await ctx.reply("Input the token address you wanna trade.");
      ctx.session.prevState = "AddToken";
      return;
    }
    const selectedTokenInfor = await getCoinInformation(selectedToken);
    const selectedTokenSymbol = selectedTokenInfor.data.symbol;

    const fromToken = prevState === "actionBuy" ? "0x1::aptos_coin::AptosCoin" : selectedToken;
    const toToken = prevState === "actionBuy" ? selectedToken : "0x1::aptos_coin::AptosCoin";
    const amount = prevState === "actionBuy" ? ctx.session.buyAmount : ctx.session.sellAmount;
    console.log("callbackquery", ctx.callbackQuery.data);
    const sufix = ctx.callbackQuery.data.split(" ")[1];

    const accountIndexes = [];
    const amounts = [];

    let replyMessage = "";
    ctx.session.toTokenAmount = [];
    ctx.session.accountIndex = [];
    ctx.session.replySell = [];

    // Setup the config for buy or sell
    if (sufix !== "All") {
      accountIndexes.push(sufix);
      if (!user.accounts[sufix].active) {
        ctx.reply("❌ This wallet is not active. Choose active wallet or activate this wallet.");
        return;
      }
      if (prevState !== "actionBuy") {
        const tokenBalance = await getAccountBalanceByTokenSymbol(
          user.accounts[sufix].accountAddress.toString(),
          selectedTokenSymbol
        );
        console.log("token balance: ", tokenBalance);
        if (tokenBalance === 0) {
          ctx.reply("❌ Insufficient token balance. Top up your wallet.");
          return;
        }
        amounts.push((tokenBalance * amount) / 100);
      } else {
        amounts.push(amount);
      }
    } else {
      console.log("Suffix == All", user.accounts.length);
      await Promise.all(
        user.accounts.map(async (account, index) => {
          console.log("in map function");
          if (!account.active) {
            replyMessage += `<b>Wallet ${+index + 1} :</b> Not activated\n`;
          } else {
            if (prevState !== "actionBuy") {
              const tokenBalance = await getAccountBalanceByTokenSymbol(
                account.accountAddress.toString(),
                selectedTokenSymbol
              );
              console.log("tokenBalance in all: ", tokenBalance);
              if (tokenBalance === 0) {
                replyMessage += `<b>Wallet ${+index + 1} :</b> Insufficient token balance. Top up wallet.\n`;
              } else {
                accountIndexes.push(index);
                amounts.push(tokenBalance * (amount / 100));
              }
            } else {
              accountIndexes.push(index);
              amounts.push(amount);
            }
          }
        })
      );
    }
    console.log("accoumtIndexes", accountIndexes, "amounts", amounts);

    if (accountIndexes.length === 0) {
      ctx.reply(replyMessage, { parse_mode: "HTML" });
    }

    // Pending message
    if (prevState === "actionBuy") {
      ctx.reply(`🔄 Buy transaction of <code>${amounts[0]} APT</code> is pending... \n Please wait for a while!`, {
        parse_mode: "HTML",
      });
    } else {
      ctx.reply(`🔄 Sell transaction is pending... \n Please wait for a while!`, {
        parse_mode: "HTML",
      });
    }

    // Buy or sell and make response message
    accountIndexes.map(async (accountIndex, index) => {
      while (isWaiting) {
        console.log("Boolean is true, delaying...");
        await delay(1000); // Delay for 1 second
      }
      isWaiting = true;

      console.log("Swap check: ", fromToken, toToken, amounts[index], user.accounts[accountIndex]);
      const data = await swapTokens(
        fromToken,
        toToken,
        amounts[index],
        user.accounts[accountIndex],
        selectedTokenSymbol
      );
      console.log("Data ================ ", data);
      const prefix = `<b>Wallet ${+accountIndex + 1}</b> : `;
      if (data?.error) {
        console.log("trade.js 318 row: ", data?.error);
        replyMessage += prefix + data.error + "\n\n";
      } else {
        let targetToken = user.tokens.find(
          (token) => token.address === selectedToken && token.accountAddress === data.accountAddress
        );

        const balanceData = await getAptosBalance([user.accounts[accountIndex].accountAddress.toString()]);
        const balances = balanceData[0];
        const targetTokenBalance = balanceData[0].find((bal) => bal.symbol === selectedTokenSymbol);
        console.log("Token balances: ", balances, targetTokenBalance);

        // console.log("get balance", toTokenAmount);

        if (targetToken) {
          if (prevState === "actionBuy") {
            targetToken.totalUsedAptosAmount += Number(amounts[index]);
            targetToken.totalUsedAptosWithFee += Number(data.fromTokenAmount);
            targetToken.totalBoughtTokenAmount += Number(data.toTokenAmount);
            targetToken.averageBoughtPrice = targetToken.totalUsedAptosWithFee / targetToken.totalBoughtTokenAmount;
            targetToken.latestBuyDate = Date.now();
          } else {
            // targetToken.totalUsedAptosAmount -= Number(data.toTokenAmount);
            // targetToken.totalUsedAptosAmount =
            // targetToken.totalUsedAptosAmount < 0 ? 0 : targetToken.totalUsedAptosAmount;
            // targetToken.totalUsedAptosWithFee -= Number(data.toTokenAmount);
            // targetToken.totalUsedAptosWithFee =
            //   targetToken.totalUsedAptosWithFee < 0 ? 0 : targetToken.totalUsedAptosWithFee;
            // targetToken.totalBoughtTokenAmount -= Number(data.fromTokenAmount);
            // targetToken.totalBoughtTokenAmount =
            //   targetToken.totalBoughtTokenAmount < 0 ? 0 : targetToken.totalBoughtTokenAmount;
            targetToken.latestBuyDate = Date.now();
            targetToken.totalSoldTokenAmount = Number(data.fromTokenAmount);
          }
        } else {
          if (prevState === "actionBuy") {
            targetToken = {
              address: toToken,
              symbol: selectedTokenSymbol,
              accountAddress: data.accountAddress,
              totalUsedAptosAmount: Number(amounts[index]),
              totalUsedAptosWithFee: Number(data.fromTokenAmount),
              totalBoughtTokenAmount: data.toTokenAmount,
              averageBoughtPrice: Number(data.fromTokenAmount) / data.toTokenAmount,
              initialBuyDate: Date.now(),
              latestBuyDate: Date.now(),
            };
            user.tokens.push(targetToken);
          } else {
            targetToken = {
              address: fromToken,
              symbol: selectedTokenSymbol,
              accountAddress: data.accountAddress,
              totalSoldTokenAmount: amounts[index],
              totalUsedAptosAmount: 0,
              totalUsedAptosWithFee: 0,
              accountAddress: data.accountAddress,
              averageBoughtPrice: 0,
              initialBuyDate: Date.now(),
              latestBuyDate: Date.now(),
            };
            user.tokens.push(targetToken);
          }
        }

        if (prevState === "actionBuy") {
          ctx.session.boughtPrice = targetToken.averageBoughtPrice;
          const pl = 0;
          replyMessage +=
            prefix +
            "✅ Buy success\n" +
            buySuccessReplyText({
              symbol: selectedTokenSymbol,
              price: data.toTokenPrice,
              avgBoughtPrice: targetToken.averageBoughtPrice,
              totalBoughtTokenAmount: data.toTokenAmount,
              pl,
              timeElapsed: 0,
              priceImpact: data.priceImpact,
              initial: targetToken.totalUsedAptosAmount,
              spentAmount: amounts[index],
              worth: (targetToken.totalBoughtTokenAmount * data.toTokenPrice) / data.fromTokenPrice,
            });
        } else {
          const soldPrice = data.toTokenAmount / data.fromTokenAmount;
          ctx.session.soldPrice = soldPrice;
          console.log("Target Token : ", targetToken);
          const worth = data.toTokenAmount;
          const initial = (data.fromTokenAmount * data.fromTokenPrice) / data.toTokenPrice;
          let pl = (soldPrice - targetToken.averageBoughtPrice) * Number(amounts[index]);
          pl = isNumber(pl) ? pl : 0;
          console.log("Sell pl", pl);
          const replySell = {
            symbol: selectedTokenSymbol,
            price: data.fromTokenPrice,
            remain: targetTokenBalance.amount / 10 ** targetTokenBalance.decimals,
            pl,
            timeElapsed: 0,
            totalSoldTokenAmount: amounts[index],
            priceImpact: data.priceImpact,
            initial: initial,
            worth: worth,
            spentAmount: initial,
            isBuy: false,
          };
          ctx.session.replySell.push(replySell);

          replyMessage += prefix + "✅ Sell success\n" + buySuccessReplyText(replySell);
        }
        ctx.session.accountIndex.push(accountIndex);
        await user.save();
      }
      if (index === accountIndexes.length - 1) {
        if (ctx.session.accountIndex.length !== 0) ctx.reply(replyMessage, buySuccessReplyMarkUp);
        else ctx.reply(replyMessage, { parse_mode: "HTML" });
        console.log(ctx.session.toTokenAmount, "===\n", ctx.session.accountIndex);
      }
      isWaiting = false;
      ctx.session.amounts = [...amounts];
    });
  } catch (error) {
    isWaiting = false;
    console.error(error);
  }
};

module.exports = { actionBuy, actionRefresh, actionWallet, actionSell, actionTurnToBuyOrSell };
