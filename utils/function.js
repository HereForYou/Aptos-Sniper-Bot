//=====================================================================================================|
//                             Validate the wallet is valid or invalid                                 |
//=====================================================================================================|
/**
 * Returns a Boolean that indicates whether or not the wallet address is a stirng of 64 hex characters
 * @param {string} walletAddress Stirng of the wallet address you want to validate
 * @returns {boolean} Return true if the walletAddress is a string of 64 hex characters, otherwise return false
 */
function isValidWallet(walletAddress) {
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

//=====================================================================================================|
//                                 Remove all tags from string                                         |
//=====================================================================================================|
/**
 * Returns a String that removed all tags from input string
 * @param {string} input String you want to delete all tags from
 * @returns {string} String that removed all tags
 */
function removeTags(input) {
  return input.replace(/<[^>]*>/g, "");
}

module.exports = { isValidWallet, removeTags };
