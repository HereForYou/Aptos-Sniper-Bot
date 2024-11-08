/**
 * The text that displayed on the page when occurs the Chains action
 */
const chainsText = `⚠️ At least one chain needs to be enabled and setup with a wallet.

🟢 Enable or 🔴 Disable chains based on your preference.

The ⚙️ Setup section can be used to connect or generate a wallet for each chain with a missing wallet.`;

const mainText = "👋Hi, there! \n 👉This is 🔫Ziptos Sniper Bot on Aptos Blockchain Network";

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

module.exports = { mainText, chainsText, addSnipeText, generateWalletText };
