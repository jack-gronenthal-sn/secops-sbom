async function upload({document, snInstanceUrl, snUsername, snPassword}) {

    let baseUrl = new URL(snInstanceUrl);
    let uploadUrl = new URL('/api/sbom/core/upload', baseUrl);

    return await fetch(uploadUrl, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Basic ${Buffer.from(snUsername + ":" + snPassword).toString('base64')}`
        },
        body: JSON.stringify(document)
    })
        .then(response => response.json())
        .then(data => {
            console.log(data)
            return data;
        })
        .catch(error => console.log(error))
}

module.exports = {upload};