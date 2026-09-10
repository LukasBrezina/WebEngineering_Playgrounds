const baseUrl = "https://en.wikipedia.org/w/api.php";

const errorData = [
    {
        name: "Error fetching bear data. Here is a placeholder :)",
        binomial: "Urban Bear Placeholder",
        image: "./media/urban-bear.jpg",
        range: "N/A"
    },
    {
        name: "And another :)",
        binomial: "Wild Bear Placeholder",
        image: "./media/wild-bear.jpg",
        range: "N/A"
    }
];

export function initializeBearsApi() {
    return fetchBearData()
        .then(wikitext => parseBears(wikitext))
        .catch(error => {
            console.error("Error fetching bears API:", error);
            return errorData;
        })
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
    try {
        return fetch(url)
            .then(res => res.json())
            .then(data => data.parse.wikitext['*']);
    } catch (error) {
        console.error("Error fetching bear data:", error);
        return Promise.reject(error);
    }
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

                try {
                    const bear = fetchImageUrl(fileName).then(imageUrl => ({
                        name: name,
                        binomial: binomial,
                        image: imageUrl,
                        range: range
                    }));
                    bears.push(bear);
                } catch (error) {
                    console.error("Error creating bear object:", error);
                }
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

    try {
        return fetch(url)
            .then(res => res.json())
            .then(data => {
                const pages = data.query.pages;
                const page = Object.values(pages)[0];
                return page.imageinfo[0].url;
            })
            .catch(() => fallbackImage)
    } catch (error) {
        console.error("Error fetching image URL:", error);
        return fallbackImage;
    }
}