import {
    books,
    getAllPagesLink
} from "./notion-interact.mjs";
import {updateAPI} from "./api-interact.mjs";

export async function update() {
    await getAllPagesLink()
    await updateAPI(books)
}