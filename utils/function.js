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
        "\n<b>Address</b>: <code>" +
        array[i].accountAddress +
        "</code>\n" +
        "<b>Private Key</b>: <code>" +
        array[i].privateKey +
        "</code>\n" +
        "<b>Public Key</b>: <code>" +
        array[i].publicKey +
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
  return !isNaN(Number(value)) && value.trim() !== "";
}

/**
 * Returns a Boolean indicates whether or not value is Interger style
 *
 * @param {String} value The String value you want to validate whether or not value is Integer
 * @returns Returns true if value is Interger style, otherwise returns false
 */
function isInteger(value) {
  const num = Number(value);
  return Number.isInteger(num) && value.trim() !== "";
}

/**
 *
 * @param {Number} num
 * @param {Number} decimal
 * @returns
 */
function roundUpToSpecificDecimalPlaces(num, decimal = 0) {
  const decimals = 10 ** decimal;
  return Math.floor(num * decimals) / decimals;
}

module.exports = { isValidWallet, removeTags, combineTextArray, isNumber, isInteger, roundUpToSpecificDecimalPlaces };
