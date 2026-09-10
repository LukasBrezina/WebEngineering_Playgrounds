export function renderBears(bears) {
    const moreBears = document.querySelector('.more_bears');

    bears.forEach(bear => {
        moreBears.innerHTML += `
            <div class="bear">
                <img src="${bear.image}" alt="${bear.name}" style="width:200px; height:auto;">
                <p><b>${bear.name}</b> (${bear.binomial})</p>
                <p>Range: ${bear.range}</p>
            </div>
        `;
    });
}