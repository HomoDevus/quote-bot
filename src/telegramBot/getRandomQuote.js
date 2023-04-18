import { config } from 'dotenv';
import { Client } from '@notionhq/client';

import { getReq, putReq } from '../dbUpdate/api-requests.mjs';

config()

const notion = new Client({ auth: process.env.NOTION_TOKEN })
const databaseId = process.env.NOTION_DATABASE_ID

export const getRandomQuote = async function () {
  let dbNotes = await getReq('/notes/')
  let dbBooks = await getReq('/books/')

  let quote = choseRandomQuote(dbNotes)
  quote.quoteText = configureTextForUpdate(quote.quoteText)

  await putReq(`/notes/${quote.id}`, { ...quote, shown: quote.shown + 1 })
  await updateBlock(quote.sectionId, quote.quoteText)

  for (let i = 0; i < dbBooks.length; i++) {
    if (dbBooks[i].id === quote.bookId) {
      quote.title = dbBooks[i].title
      quote.author = dbBooks[i].author
    }
  }

  return quote;
}

function choseRandomQuote(notes) {
  // Create array of type: [1,1,1,1,1,2,2,2,2,3,3,3,4,4,5] with ids as values. Then randomly chose id
  let chance = []

  let maxShown = 0
  for (let note of notes) {
    if (note.shown > maxShown) {
      maxShown = note.shown
    }
  }

  for (let note of notes) {
    for (let i = 0; i <= (maxShown - note.shown + 1); i++) {
      chance.push(note.id)
    }
  }

  let randomNoteId = chance[Math.floor(Math.random() * chance.length)];
  for (let note of notes) {
    if (randomNoteId === note.id) {
      return note
    }
  }
}

/**
 * Add shown to previous str if there isn't one. If there is add +1 to the shown counter.
 * @param prev
 * @returns {`${string}[Shown: ${number}]`}
 */
function configureTextForUpdate(prev) {
  let shown = getShownProp(prev)
  let counterPosition = prev.indexOf(' [Shown: ')
  let newText = ''

  if (shown === 0) {
    newText = `${prev} [Shown: 1]`
  } else {
    newText = `${prev.slice(0, counterPosition)} [Shown: ${shown + 1}]`
  }
  return newText
}

function getShownProp(text) {
  let str = ' [Shown: '
  let counterPosition = text.indexOf(str)

  if (counterPosition !== -1) {
    let counter = text.slice(counterPosition, text.length)
    return +counter.substring(
      counter.indexOf(': ') + 2,
      counter.lastIndexOf(']')
    )
  } else {
    return 0
  }
}

/**
 * Replace block text in notion.
 * @param blockId
 * @param text
 * @returns {Promise<void>}
 */
async function updateBlock(blockId, text) {
  try {
    const response = await notion.blocks.update({
      block_id: blockId,
      'paragraph': {
        rich_text: [{
          type: 'text',
          text: {
            content: text
          }
        }],
      }
    });
    console.log(response)
  } catch (e) {
    console.error(e)
  }
}