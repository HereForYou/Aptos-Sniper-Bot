const User = require("../models/user.model");
const { roundUpToSpecificDecimalPlaces } = require("../utils/function");

/**
 * The text that displayed on the page when occurs the Chains action
 */
const chainsText = `⚠️ At least one chain needs to be enabled and setup with a wallet.

🟢 Enable or 🔴 Disable chains based on your preference.

The ⚙️ Setup section can be used to connect or generate a wallet for each chain with a missing wallet.`;

const mainText = () => {
  return "👋 Hi, there! \n 👉 This is 🔫Ziptos Sniper Bot on Aptos Blockchain Network";
};

const addSnipeText = (text) => {
  return `
👍 Great! Ready to start snipe.

${text}
👉 Click start`;
};

/**
 *
 * @param {string} address The newly generated wallet address
 * @param {string} privateKey The newly generated wallet Private Key
 * @param {string} publicKey The newly generated wallet Public Key
 * @returns Returns the text displayed on the page
 */
const generateWalletText = (address, privateKey, publicKey) => {
  return `
    ✅ Generated new wallet:

    Chain: <b>APTOS</b>

    Address: <code>${address}</code>
    Private Key: <code>${privateKey}</code>
    Public Key: <code>${publicKey}</code>
    
    ⚠️ <i>Make sure to save this private key using pen and paper only. Do NOT copy-paste it anywhere. You could also import it to your Metamask/Trust Wallet. After you finish saving/importing the wallet credentials, delete this message. The bot will not display this information again.</i>`;
};

const autoSnipeConfigText = `
Add a token address you want to snipe.`;

/**
 *
 * @param {Object} param0
 * @returns Return the reply text when buying token succeeds
 */
const buySuccessReplyText = ({
  symbol,
  price,
  pl,
  timeElapsed,
  priceImpact,
  mainTokenSymbol = "APT",
  initial,
  worth,
}) => {
  return `<b>📌 Primary Trade</b>
💳 Main
🌎 $${symbol} 🚀 ${roundUpToSpecificDecimalPlaces(pl, 2)}% ⏱ what?
💶 Initial: <b>${initial} ${mainTokenSymbol}</b>
💷 Worth: <b>${roundUpToSpecificDecimalPlaces(worth, 5)} ${mainTokenSymbol}</b>
⏳ Time elapsed: <b>${timeElapsed}</b>

💵 Price: <b>$${price}</b>
📉 CA Balance | 0% what?
⚖ Taxes: 🅑 0% 🅢 0% what?

📈 P/L: <b>${roundUpToSpecificDecimalPlaces(pl, 2)}</b>%
💸 Price Impact: <b>${priceImpact}</b>%
🤑 Expected Payout: <b>${roundUpToSpecificDecimalPlaces(initial - worth, 5)} ${mainTokenSymbol}</b>
`;
};

module.exports = { mainText, chainsText, autoSnipeConfigText, addSnipeText, generateWalletText, buySuccessReplyText };
