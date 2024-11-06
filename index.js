const { Telegraf } = require("telegraf");
require("dotenv").config({});

const bot = require("./bot");

const { getTokenList } = require("./utils/panora");
getTokenList();
