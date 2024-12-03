const crypto = require("crypto");

/**
 * Returns a Boolean that indicates whether or not the wallet address is a stirng of 64 hex characters
 *
 * @param {string} walletAddress Stirng of the wallet address you want to validate
 * @returns {boolean} Return true if the walletAddress is a string of 64 hex characters, otherwise return false
 */
function isValidWallet(walletAddress) {
  // Check if the wallet address starts with 0x
  if (!walletAddress.startsWith("0x")) {
    return false;
  }
  // Check if the wallet address is a string of 64 hex characters
  const hexRegex = /^[0-9a-fA-F]{64}$/;
  if (typeof walletAddress === "string" && hexRegex.test(walletAddress.slice(2))) {
    return true;
  } else {
    return false;
  }
}

/**
 * Returns a String that removed all tags from input string
 *
 * @param {string} input String you want to delete all tags from
 * @returns {string} String that removed all tags
 */
function removeTags(input) {
  return input.replace(/<[^>]*>/g, "");
}

/**
 * Returns a string combines the array with code style that telegram bot can recognize
 *
 * @param {Array} array The array you want to combine
 * @param {String} type The subject of each item in array
 * @param {Array} active The number of array that is active
 * @param {Array} coins The number of array that is active
 * @returns Returns a string conbines the array with type subject, the active number of array is active
 */
function combineTextArray(array, type, active = [], coins = null, account = false) {
  let replyMessage = "";
  for (let i = 0; i < array.length; i++) {
    if (!account) {
      if (active.includes(i) || type === "Token Address") replyMessage += "🟢 ";
      else replyMessage += "🔴 ";
      replyMessage += "<b>" + type + (i + 1) + "</b>: <code>" + array[i] + "</code>\n";

      if (coins !== null) {
        for (let j = 0; j < coins[i].length; j++) {
          if (coins[i][j].amount !== 0)
            replyMessage +=
              "<b>Name</b>: " +
              coins[i][j].name +
              "\n<b>Symbol</b>: " +
              coins[i][j].symbol +
              "\n<b>Amount</b>: " +
              coins[i][j].amount / 10 ** coins[i][j].decimals +
              "\n\n";
        }
      }
    } else {
      replyMessage +=
        // "\n<b>Address</b>: <code>" +
        // array[i].accountAddress +
        // "</code>\n" +
        "\n<b>Private Key</b>: <code>" +
        decrypt(array[i].privateKey) +
        "</code>\n" +
        "<b>Public Key</b>: <code>" +
        array[i].accountAddress +
        "</code>\n";
    }
  }
  return replyMessage;
}

/**
 * Returns a Boolean indicates whether or not value is number style
 *
 * @param {String} value The string you want to validate whether the value is number or not
 * @returns Returns true if value is string converted to number, otherwise false
 */
function isNumber(value) {
  return !isNaN(Number(value)) && value != "Infinity" && value.toString().trim() !== "";
}

/**
 * Returns a Boolean indicates whether or not value is Interger style
 *
 * @param {String} value The String value you want to validate whether or not value is Integer
 * @returns Returns true if value is Interger style, otherwise returns false
 */
function isInteger(value) {
  const num = Number(value);
  return Number.isInteger(num) && value?.trim() !== "";
}

/**
 * Round up the number into the specific decimal position number.
 *
 * @param {Number} num The number you want to round up.
 * @param {Number} decimal The number of decimal position you want to round up
 * @returns Return the number that rounded up into the specific decimal position.
 */
function roundUpToSpecificDecimalPlaces(num, decimal = 0) {
  const decimals = 10 ** decimal;
  return Math.floor(num * decimals) / decimals;
}

/**
 * Convert the miliseconds to this type string 'XXd XXh XXm XXs'
 *
 * @param {Number} ms The miliseconds that you want to convert
 * @returns Return the string 'XXd XXh XXm XXs'
 */
function convertMilliseconds(ms) {
  const seconds = Math.floor(ms / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);
  const months = Math.floor(days / 30); // Using 30 days as an average month

  const remainingDays = days % 30;
  const remainingHours = hours % 24;
  const remainingMinutes = minutes % 60;
  const remainingSeconds = seconds % 60;

  return `${remainingDays ? remainingDays + "d " : ""}${remainingHours ? remainingHours + "h " : ""}${
    remainingMinutes ? remainingMinutes + "m " : ""
  }${remainingSeconds}s`;
}

/**
 * The function to delay during ms miliseconds
 *
 * @param {number} ms Specify how long does it want to delay in miliseconds
 * @returns Return promise
 */
function delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// The key to use to encrypt data.
const key = process.env.PRIVATE_KEY;
const iv = process.env.IV;

/**
 * Function to encrypt the data with aes-256-cbc algorithm
 *
 * @param {string} text string data you want to encrypt (e.g. private key, password ...)
 * @returns Return encrypted data
 */
function encrypt(text) {
  const algorithm = "aes-256-cbc";

  const cipher = crypto.createCipheriv(algorithm, Buffer.from(key, "hex"), Buffer.from(iv, "hex"));
  let encrypted = cipher.update(text, "utf8", "hex");
  encrypted += cipher.final("hex");

  // Return the encrypted text along with the IV and key
  return { encryptedData: encrypted };
}

/**
 * Function to decrypt the encrypted data
 *
 * @param {string} encryptedData Encrypted data you want to decrypt
 * @returns Return the decrypted data
 */
function decrypt(encryptedData) {
  const algorithm = "aes-256-cbc";
  const decipher = crypto.createDecipheriv(algorithm, Buffer.from(key, "hex"), Buffer.from(iv, "hex"));
  let decrypted = decipher.update(encryptedData, "hex", "utf8");
  decrypted += decipher.final("utf8");
  return decrypted;
}

module.exports = {
  delay,
  isValidWallet,
  removeTags,
  combineTextArray,
  isNumber,
  isInteger,
  roundUpToSpecificDecimalPlaces,
  convertMilliseconds,
  encrypt,
  decrypt,
};
