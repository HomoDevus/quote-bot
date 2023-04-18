import {getReq, postReq, deleteReq} from "./api-requests.mjs";

export async function updateAPI(books) {
    let dbBooks = await getReq('/books/');
    let dbNotes = await getReq('/notes/');

    // Add missing books and notes
    for (let book of books) {
        // Getting db version of book in the loop
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

    // Delete removed books with its notes
    for (let dbBook of dbBooks) {
        let book = books.filter(book => book.title === dbBook.title)

        // If book from db dosen't exist in Notion
        if (book.length === 0) {
            await deleteReq(`/books/${dbBook.id}`)
        }
    }
}