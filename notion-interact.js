const {config} = require('dotenv');
const { Client } = require('@notionhq/client');
const fetch = require('node-fetch');
const axios = require('axios')

config()

const dataBaseId = process.env.NOTION_DATABASE_ID;
const notion = new Client({ auth: process.env.NOTION_TOKEN });
let books = [{title: 'af', author: 'v', notes: [{quoteText: 'b', shown: 1}, 'c']}];
let notes = [];

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
                for (let section of page.sections.results) {
                    if (section.paragraph.text.length === 0) continue;
                    let sectionText = '';
                    for (let textPart of section.paragraph.text) {
                        sectionText += textPart.plain_text
                    }
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

async function updateAPI(url) {
    // await getAllPagesLink();

    // let res = await fetch(url)
    // let json = await res.json();
    // console.log(json)

    try {
        // await fetch(url, {method: 'delete'});
        let req = await axios.delete(url + '/' + 3)
        console.log(req.data)
    } catch (e) {
        console.log(e)
    }

    // let res = await fetch(url)
    // let json = await res.json();
    // console.log("first check", json)

    // for (let book of books) {
    //     try {
    //         let response = await fetch(url, {
    //         method: "PUT",
    //         headers: {
    //         "Content-Type": "application/json",
    //         },
    //         body: JSON.stringify(book),
    //         })
    //         let json = await response.json()
    //         console.log(json)
    //     } catch(e) {
    //         console.error('API error:', e)
    //     }
    // }
}

updateAPI('http://localhost:8000/books')

function postRequest() {
    let data = { 
        "title": notes.title, 
        "author": notes.quthor,
        "text": notes.quoteText,
        "shown": getShownProp(quoteText)
      }
      
       fetch('http://localhost:8000/posts/', {
       method: "POST",
       headers: {
       "Content-Type": "application/json",
       },
       body: JSON.stringify(data),
       })
       .then(response => response.json())
       .then(response => console.log('Success:', JSON.stringify(response)))
       .catch(error => console.error('Error:', error));
}

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