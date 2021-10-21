const { Client } = require('@notionhq/client');
const dataBaseId = process.env.NOTION_DATABASE_ID;
const notion = new Client({ auth: process.env.NOTION_TOKEN });
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
                        title: page.header.properties.Title.title[0].plain_text,
                        author: page.header.properties.Author.rich_text[0].plain_text,
                        quoteText: sectionText,
                        sectionId: section.id
                    });
                }
            }
        }
    )
}

module.exports.getQuote = async function getQuote() {
    await getAllPagesLink();
    let randomNote = getRandomBlock(notes)
    let textForUpdate = configureTextForUpdate(randomNote.quoteText)
    await updateBlock(randomNote.sectionId, textForUpdate)
    randomNote.quoteText = textForUpdate
    return exports.note = randomNote;
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