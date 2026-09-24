import { type Bear } from '../models/bear.js';

export function renderBears(bears: Bear[]): void {
  const moreBears = document.querySelector('.more_bears');

  if (moreBears === undefined || moreBears === null) {
    throw new Error("Element with class 'more_bears' not found");
  }

  // fragment is a 'temp' container, where the bear divs are added to
  // before adding to DOM to only trigger one reflow instead of one for each bear div
  const fragment = document.createDocumentFragment();

  bears.forEach((bear) => {
    const bearDiv = document.createElement('div');
    bearDiv.className = 'bear';

    const img = document.createElement('img');
    img.src = bear.image;
    img.alt = bear.name;
    img.style.width = '200px';
    img.style.height = 'auto';

    const nameP = document.createElement('p');
    const boldName = document.createElement('b');
    boldName.textContent = bear.name;
    nameP.appendChild(boldName);
    nameP.append(` (${bear.binomial})`);

    const rangeP = document.createElement('p');
    rangeP.textContent = `Range: ${bear.range}`;

    bearDiv.append(img, nameP, rangeP);
    fragment.appendChild(bearDiv);
  });

  // appending a fragment only appends the fragments child nodes, other than a section for example
  // the result is the same as appending each child node of the fragment to the DOM
  moreBears.appendChild(fragment);
}
