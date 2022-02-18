import {
    books,
    notes,
    getAllPagesLink
} from "./notion-interact.mjs";
import {updateAPI} from "./api-interact.mjs";
import {
    getReq,
    postReq,
    putReq,
    deleteReq
} from "./api-requests.mjs";

test()

async function test() {
    let dbBooks = await getReq('/books/');
    let dbNotes = await getReq('/notes/');

    console.log(dbBooks)
    console.log(dbNotes)
}

// TODO test getting data from notion, try to update db