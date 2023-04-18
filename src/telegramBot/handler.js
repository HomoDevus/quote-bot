import {config} from 'dotenv';
import {Telegraf} from 'telegraf';
import {getRandomQuote} from './getRandomQuote.js';

config()

const bot = new Telegraf(process.env.BOT_TOKEN) // get the token from envirement variable
const chatId = process.env.CHAT_ID

function toEscapeMSg(str) {
  return str
      .replace(/_/gi, "\\_")
      .replace(/-/gi, "\\-")
      .replace("~", "\\~")
      .replace(/`/gi, "\\`")
      .replace(/\./g, "\\.")
      .replace(/\)/gi, "\\)")
      .replace(/\(/gi, "\\(")
      .replace(/!/gi, "\\!");
}

export async function sendRandomQuote() {
  let quote = await getRandomQuote()
  await bot.telegram.sendMessage(chatId,
      `*${toEscapeMSg(quote.title)}* \\- _${toEscapeMSg(quote.author)}_\n\n${toEscapeMSg(quote.quoteText)}`,
      { parse_mode: "MarkdownV2" })
};