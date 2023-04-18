import { Telegraf } from 'telegraf';
import * as cron from 'node-cron';

import { sendRandomQuote } from './handler.js';
import { getAllPagesLink } from '../dbUpdate/notion-interact.mjs';
import { updateAPI } from '../dbUpdate/api-interact.mjs';

const bot = new Telegraf(process.env.BOT_TOKEN) // get the token from envirement variable
const chatId = process.env.CHAT_ID

let cronExpression = '0 8,19 * * *'
let cronDailyQuoteJob

export async function botStart() {
  bot.command('is_running', async (ctx) => {
    await ctx.reply('Bot is running 👟')
  })

  bot.command('test', async (ctx) => {
    await ctx.reply('Testing 🧪...')

    try {
      await sendRandomQuote()
      await ctx.reply('Success')
    } catch (e) {
      await ctx.reply('Test failed')
    }
  })

  bot.command('update', async (ctx) => {
    await ctx.reply('Books are loading...')

    try {
      let books = await getAllPagesLink()
      await updateAPI(books)
      await ctx.reply('Book notes were updated 🗃')
      await ctx.reply(`You have ${books.length} uploaded books 📚`)
    } catch (e) {
      console.error(e)
      await ctx.reply('Books loading ended with an error')
    }
  })

  bot.command('schedule', async (ctx) => {
    if (cronDailyQuoteJob) {
      await ctx.reply('Schedule already exists')
    } else {
      cronDailyQuoteJob = cron.schedule(cronExpression, sendRandomQuote)
      await ctx.reply(`Bot schedule is started\\. Cron expression: \`${toEscapeMSg(cronExpression)}\``, { parse_mode: 'MarkdownV2' })
    }
  })

  bot.command('stop_schedule', async (ctx) => {
    if (cronDailyQuoteJob) {
      cronDailyQuoteJob.stop()
      await ctx.reply('Bot schedule is stopped 🛑')
    } else {
      await ctx.reply('There is no schedule to be stopped')
    }
  })

  bot.launch()

  await bot.telegram.sendMessage(chatId, 'Bot is running')
}

export async function botKill() {
  await bot.telegram.sendMessage(chatId, 'Killing the bot')
  cronDailyQuoteJob.stop()
  await bot.stop()
}

function toEscapeMSg(str) {
  return str
    .replace(/_/gi, '\\_')
    .replace(/-/gi, '\\-')
    .replace('~', '\\~')
    .replace(/`/gi, '\\`')
    .replace(/\./g, '\\.')
    .replace(/\)/gi, '\\)')
    .replace(/\(/gi, '\\(')
    .replace(/!/gi, '\\!');
}
