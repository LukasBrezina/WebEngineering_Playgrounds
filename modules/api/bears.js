// Style – global constants are defined in uppercase
import { errorData } from "../data/bear-errordata.js";

const BASE_URL = "https://en.wikipedia.org/w/api.php";
const FALLBACK_IMAGE = './media/wild-bear.jpg'
// Magic number – extracted to a constant for clarity and maintainability
const WIKIPEDIA_SECTION_INDEX = 3;

export async function initializeBearsApi() {
    try {
        const wikitext = await fetchBearWikitext();
        return await parseBears(wikitext);
    } catch (error) {
        console.error("Error fetching bears API:", error);
        return errorData;
    }
}

// Style – unclear function name
const fetchBearWikitext = async () => {
    // Fetching bear data
    const data = await fetchWikipediaApi({
        action: "parse",
        page: "List_of_ursids",
        prop: "wikitext",
        section: WIKIPEDIA_SECTION_INDEX,
        format: "json",
        origin: "*"
    });
    return data.parse.wikitext['*'];
};

// Single Responsibility – Only parsing, nothing else
function parseBear(bear) {
    const nameMatch = bear.match(/\|name=\[\[(.*?)\]\]/);
    const binomialMatch = bear.match(/\|binomial=(.*?)\n/);
    const imageMatch = bear.match(/\|image=(.*?)\n/);
    const rangeMatch = bear.match(/\|range=([^|]+)/);

    if (!nameMatch || !binomialMatch || !imageMatch) {
        return null;
    }

    return {
        name: nameMatch[1],
        binomial: binomialMatch[1],
        fileName: imageMatch[1].trim().replace("File:", ""),
        range: rangeMatch ? rangeMatch[1].trim() : "N/A"
    };
}

const parseBears = async (wikitext) => {
    const speciesTables = wikitext.split('{{Species table/end}}');

    // flatten array to single list and parse bears
    const parsedRows = speciesTables.flatMap(table =>
        table.split("{{Species table/row"))
        .map(parseBear)
        .filter(Boolean); // TODO

    // each fetchImageUrl request is awaited concurrently (Promise.all)
    // try & catch is unnecessary, as fetchImageUrl handles errors and returns a fallback image
    return Promise.all(
        parsedRows.map(async ({ name, binomial, fileName, range }) => ({
            name,
            binomial,
            range,
            image: await fetchImageUrl(fileName)
        }))
    );
}

const fetchImageUrl = async (fileName) => {
    try {
        const data = await fetchWikipediaApi({
            action: "query",
            titles: "File:" + fileName,
            prop: "imageinfo",
            iiprop: "url",
            format: "json",
            origin: "*"
        });

        const pages = data.query.pages;
        const page = Object.values(pages)[0];
        return page.imageinfo?.[0]?.url ?? FALLBACK_IMAGE;
    } catch (error) {
        console.error("Error fetching image URL:", error);
        return FALLBACK_IMAGE;
    }
}

// Single Responsibility – Only fetching, nothing else
// Duplicated Code – extracted fetching from fetchingBearWikitext and fetchImageUrl
async function fetchWikipediaApi(params) {
    const url = BASE_URL + "?" + new URLSearchParams(params).toString();
    const response = await fetch(url);
    return await response.json();
}