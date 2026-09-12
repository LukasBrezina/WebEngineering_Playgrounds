// Single Responsibility – extract removing old highlights and highlighting new nodes into separate methods for better maintainability (Extract Method)
export function initializeSearch() {
    document.querySelector('.search').addEventListener('submit', function(e) {

        e.preventDefault();

        removeHighlights();

        // 'this' refers to the context, which is the form element
        // therefore it is possible to select the input value via element name (name = inputField)
        const searchKey = this.inputField.value.trim();
        this.inputField.value = ""; // reset value after copying it to searchKey

        if (!searchKey) {
            alert("Please enter a search term.");
            return
        }

        const regex = new RegExp('(' + searchKey.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + ')', 'gi');

        // only search in article
        document.querySelectorAll('article').forEach(article => highlightNode(article, regex));
    });
}

// Extract methods
function removeHighlights() {
    document.querySelectorAll('.highlight').forEach(el => {
        let parent = el.parentNode;
        parent.replaceChild(document.createTextNode(el.textContent), el);
        parent.normalize();
    });
}

function highlightNode(node, regex) {
    if (node.nodeType === Node.TEXT_NODE) { // Text node – use Node.TEXT_NODE instead of '3'
        const match = node.nodeValue.match(regex);

        if (match) {
            // creates a span with child elements (text + markedText + text)
            const span = document.createElement('span');
            span.innerHTML = node.nodeValue.replace(regex, '<mark class="highlight">$1</mark>');
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
        Array.from(node.childNodes).forEach(child => highlightNode(child, regex));
    }
}
