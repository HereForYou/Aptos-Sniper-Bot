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
 * @param {Number} active The number of array that is active
 * @param {Array} coins The number of array that is active
 * @returns Returns a string conbines the array with type subject, the active number of array is active
 */
function combineTextArray(array, type, active = -1, coins = []) {
  let replyMessage = "";
  for (let i = 0; i < array.length; i++) {
    if (active === i || type === "Token Address") replyMessage += "🟢 ";
    else replyMessage += "🔴 ";
    replyMessage += "<b>" + type + "</b>: <code>" + array[i] + "</code>\n";

    for (let j = 0; j < coins.length; j++) {
      if (coins[j].amount !== 0)
        replyMessage +=
          "<b>Name</b>: " +
          coins[j].name +
          "\n<b>Symbol</b>: " +
          coins[j].symbol +
          "\n<b>Amount</b>: " +
          coins[j].amount +
          "\n\n";
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

module.exports = { isValidWallet, removeTags, combineTextArray, isNumber, isInteger };
