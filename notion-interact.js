const {config} = require('dotenv');
const { Client } = require('@notionhq/client');
const fetch = require('node-fetch');
const axios = require('axios')

config()

const dataBaseId = process.env.NOTION_DATABASE_ID;
const notion = new Client({ auth: process.env.NOTION_TOKEN });
let books = [];
let notes = [];
const API_URL = process.env.API_URL;

Promise.delay = function(t, val) {
    return new Promise(resolve => {
        setTimeout(resolve.bind(null, val), t);
    });
}

Promise.raceAll = function(promises, timeoutTime, timeoutVal) {
    return Promise.all(promises.map(p => {
        return Promise.race([p, Promise.delay(timeoutTime, timeoutVal)])
    }));
}


function getRandomInt(max) {
    return Math.floor(Math.random() * max);
}

async function getPage(pageId) {
    let pageAPI = {}
    pageAPI.sections = await notion.blocks.children.list({ block_id: pageId });
    pageAPI.header = await notion.pages.retrieve({ page_id: pageId });
    return pageAPI;
}

async function getDataBase(databaseId) {
    return await notion.databases.query({ database_id: databaseId })
}

async function getAllPagesLink() {
    let requests = [];
    let dataBase = await getDataBase(dataBaseId);
    for (let page of dataBase.results) {
        requests.push(getPage(page.id));
    }
    await Promise.all(requests)
        .then((result) => {
            for (let page of result) {
                let id = 0;
                for (let section of page.sections.results) {
                    if (section.paragraph.text.length === 0) continue;
                    let sectionText = '';
                    for (let textPart of section.paragraph.text) {
                        sectionText += textPart.plain_text
                    }
                    id += 1
                    notes.push({
                        quoteText: sectionText,
                        sectionId: section.id,
                        shown: getShownProp(sectionText)
                    });
                }
                books.push({
                    title: page.header.properties.Title.title[0].plain_text,
                    author: page.header.properties.Author.rich_text[0].plain_text,
                    notes: notes
                })
                notes = [];
            }
        }
    )
}

// module.exports.getQuote = async function getQuote() {
//     await getAllPagesLink();
//     let randomNote = getRandomBlock(notes)
//     let textForUpdate = configureTextForUpdate(randomNote.quoteText)
//     await updateBlock(randomNote.sectionId, textForUpdate)
//     randomNote.quoteText = textForUpdate
//     return exports.note = randomNote;
// }

function getRandomBlock(notes) {
    let minShown = Infinity;
    let minShownNotes = [];
    for (let note of notes) {
        let shown = getShownProp(note.quoteText)
        if (shown < minShown) {
            minShown = shown
            minShownNotes = [note]
        } else if (shown === minShown) {
            minShownNotes.push(note)
        }
    }
    return minShownNotes[getRandomInt(minShownNotes.length)]
}

function getShownProp(text) {
    let str = ' [Shown: '
    let counterPosition = text.indexOf(str)

    if (counterPosition !== -1) {
        let counter = text.slice(counterPosition, text.length)
        return +counter.substring(
            counter.indexOf(": ") + 2,
            counter.lastIndexOf("]")
        )
    } else {
        return 0
    }
}

/**
 * Add shown to previous str if there isn't one. If there is add +1 to the shown counter.
 * @param prev
 * @param blockId
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

/**
 * Replace block text in notion.
 * @param blockId
 * @param text
 * @returns {Promise<void>}
 */
async function  updateBlock(blockId, text) {
    const response = await notion.blocks.update({
        block_id: blockId,
        "paragraph": {
            "text": [{
                "type": "text",
                "text": {
                    "content": text,
                    "link": null
                }
            }]
        }
    });
}


// ========== Update API ==========
updateAPI()

async function updateAPI() {
    await getAllPagesLink();

    let dbBooks = await getReq('/books/');
    let dbNotes = await getReq('/notes/');

    for (let book of books) {
        // Get book from API
        let dbTargetBook = dbBooks.filter(dbBook => dbBook.title === book.title)
        if (dbTargetBook.length === 0) { // If book dosen't exist on API
            // Add book to API
            let newBook = await postReq('/books/', {title: book.title, author: book.author});
            // Add notes to API
            for (let note of book.notes) {
                await postReq('/notes/', {...note, bookId: newBook.id})
            }
        } else {
            dbTargetBook = dbTargetBook[0]
            let dbBookNotes = dbNotes.filter((note) => note.bookId === dbTargetBook.id); // Notes from Server
            let bookNotes = book.notes; // Notes from Notion
            let toRemove, toAdd

            function arrayStringfy(array) {
                return array.map(item => JSON.stringify(item))
            }

            // In order to compare objects we need to stringfy them.
            // dbBookNotes = arrayStringfy(dbBookNotes)
            // bookNotes = arrayStringfy(bookNotes)

            // Add notes that exist on Server but not in Notion
            let dbNotesText = dbBookNotes.map(note => note.quoteText)
            let notesText = bookNotes.map(note => note.quoteText)
            toRemove = dbBookNotes.filter(item => !notesText.includes(item.quoteText))
            // Add notes that exist on Notion but not on Server
            toAdd = bookNotes.filter(item => !dbNotesText.includes(item.quoteText))

            for (let noteToRemove of toRemove) {
            // In order to have acess to Object properties we have to parse them from JSON frist
                await deleteReq(`/notes/${noteToRemove.id}`)
            }

            for (let noteToAdd of toAdd) {
                await postReq('/notes/', {...noteToAdd, bookId: dbTargetBook.id})
            }
        }
    }
}

async function getReq(path) {
    try {
        let res = await fetch(API_URL + path)
        let json = await res.json();
        return json
    } catch (e) {
        console.error("GET:", e)
    }
}

async function postReq(path, data) {
    try {
        var res = await fetch(API_URL + path, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(data),
        })
        let json = await res.json()
        return json
    } catch (e) {
        console.error("POST:", e)
    }
}

async function deleteReq(path) {
    try {
        await fetch(API_URL + path, {method: 'delete'});
    } catch (e) {
        console.error("DELETE", e)
    }
}