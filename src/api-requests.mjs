import fetch from "node-fetch";

const URL = 'http://localhost:8000'

export async function getReq(path, id = false) {
    if (id) {
        path += id.toString()
    }

    try {
        let res = await fetch(URL + path)
        let json = await res.json();
        return json
    } catch (e) {
        console.error("GET:", e)
    }
}

export async function postReq(data) {
    try {
        let res = await fetch(URL, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(data),
        })
        let json = await res.json()
        console.log("POST:", JSON.stringify(json))
    } catch (e) {
        console.error("POST:", e)
    }
}

export async function deleteReq() {
    try {
        await fetch(URL, {method: 'delete'});
    } catch (e) {
        console.error('DELETE', e)
    }
}

export async function putReq(data, id) {
    try {
        let response = await fetch(URL + id, {
            method: 'PUT',
            body: JSON.stringify(data),
            headers: {
                'Content-type': 'application/json; charset=UTF-8',
            }})
        let json = await response.json()
        console.log("PUT:", json)
    } catch(e) {
        console.error('PUT:', e)
    }
}