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

module.exports = { isValidWallet };
