export function renderBears(bears) {
    const moreBears = document.querySelector('.more_bears');

    // Before: each iteration appends to innerHTML and therefore rebuilts the entire html structure
    // After: build whole html at once and then update innerHTML, only one single DOM update
    const html = bears.map(bear => `
        <div class="bear">
            <img src="${bear.image}" alt="${bear.name}" style="width:200px; height:auto;">
            <p><b>${bear.name}</b> (${bear.binomial})</p>
            <p>Range: ${bear.range}</p>
        </div>
    `).join("")

    moreBears.innerHTML += html;
}