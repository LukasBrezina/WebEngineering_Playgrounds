// Single Responsibility – extract removing old highlights and highlighting new nodes into separate methods for better maintainability (Extract Method)
export function initializeSearch(): void {
  const form = document.querySelector<HTMLFormElement>('.search');
  const inputField = form?.elements.namedItem('inputField');

  if (
    form == null ||
    inputField == null ||
    !(inputField instanceof HTMLInputElement)
  ) {
    throw new Error('Required elements not found in the DOM');
  }

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    removeHighlights();

    const searchKey = inputField.value.trim();
    inputField.value = ''; // reset value after copying it to searchKey

    if (searchKey === undefined || searchKey === null) {
      alert('Please enter a search term.');
      return;
    }

    const regex = new RegExp(
      '(' + searchKey.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + ')',
      'gi'
    );

    // only search in article
    document.querySelectorAll('article').forEach((article) => {
      highlightNode(article, regex);
    });
  });
}

// Extract methods
function removeHighlights(): void {
  document.querySelectorAll('.highlight').forEach((element) => {
    const parent = element.parentNode;
    element.replaceWith(document.createTextNode(element.textContent ?? ''));
    parent?.normalize();
  });
}

function highlightNode(node: Node, regex: RegExp): void {
  if (node instanceof Text) {
    const text = node.nodeValue ?? '';

    if (text.trim() === '') {
      return;
    }

    if (text.match(regex) !== null) {
      // creates a span with child elements (text + markedText + text)
      const span = document.createElement('span');
      span.innerHTML = text.replace(regex, '<mark class="highlight">$1</mark>');
      // use spread (...) syntax instead of replaceWith.apply
      // calls replaceWith with each element from span.childnodes as separate arguments
      // replace old single text node with the new child nodes (text + markedText + text)
      node.replaceWith(...span.childNodes);
    }
    return;
  }
  if (node.nodeType === Node.ELEMENT_NODE) {
    // node.childNodes is a live list (during forEach it changes as we create new nodes when highlighting text)
    // therefore we first copy it to an array and then iterate over it (Array.from)
    // otherwise we would iterate over a changing list which would lead to errors
    Array.from(node.childNodes).forEach((child) => {
      highlightNode(child, regex);
    });
  }
}
