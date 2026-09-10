const baseUrl = "https://en.wikipedia.org/w/api.php";

export function initializeBearsApi() {
    return fetchBearData().then(wikitext => parseBears(wikitext))
}

function fetchBearData() {
    // Fetching bear data
    const params = {
        action: "parse",
        page: "List_of_ursids",
        prop: "wikitext",
        section: 3,
        format: "json",
        origin: "*"
    };

    const url = baseUrl + "?" + new URLSearchParams(params).toString();
    return fetch(url)
        .then(res => res.json())
        .then(data => data.parse.wikitext['*']);
}

function parseBears(wikitext) {
    const speciesTables = wikitext.split('{{Species table/end}}');
    const bears = [];

    speciesTables.forEach(table => {
        const rows = table.split('{{Species table/row');

        rows.forEach(row => {
            const nameMatch = row.match(/\|name=\[\[(.*?)\]\]/);
            const binomialMatch = row.match(/\|binomial=(.*?)\n/);
            const imageMatch = row.match(/\|image=(.*?)\n/);
            const rangeMatch = row.match(/\|range=([^|]+)/);

            if (nameMatch && binomialMatch && imageMatch) {
                const fileName = imageMatch[1].trim().replace('File:', '');
                const binomial = binomialMatch[1];
                const name = nameMatch[1];
                const range = rangeMatch[1].trim();

                const bear = fetchImageUrl(fileName).then(imageUrl => ({
                    name: name,
                    binomial: binomial,
                    image: imageUrl,
                    range: range
                }));
                bears.push(bear);
            }
        });
    });

    return Promise.all(bears);
}


function fetchImageUrl(fileName) {

    const fallbackImage = './media/wild-bear.jpg'

    const imageParams = {
        action: "query",
        titles: "File:" + fileName,
        prop: "imageinfo",
        iiprop: "url",
        format: "json",
        origin: "*"
    };

    const url = baseUrl + "?" + new URLSearchParams(imageParams).toString();
    return fetch(url)
        .then(res => res.json())
        .then(data => {
            const pages = data.query.pages;
            const page = Object.values(pages)[0];
            return page.imageinfo[0].url;
        })
        .catch(() => fallbackImage)
}