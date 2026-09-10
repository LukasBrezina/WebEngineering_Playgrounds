export function initializeSearch() {
    // Search highlighter
    document.querySelector('.search').addEventListener('submit', function(e) {
        e.preventDefault();

        // remove old highlights
        document.querySelectorAll('.highlight').forEach(el => {
            let parent = el.parentNode;
            parent.replaceChild(document.createTextNode(el.textContent), el);
            parent.normalize();
        });

        // 'this' refers to the context, which is the form element
        // therefore it is possible to select the input value via element name (name = inputField)
        const searchKey = this.inputField.value.trim();
        console.log('Searching for:', searchKey);
        this.inputField.value = ""; // reset value

        if (!searchKey) {
            alert("Please enter a search term.");
            return
        }

        const regex = new RegExp('(' + searchKey.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + ')', 'gi');

        function highlightSearchKey(node) {
            if (node.nodeType === 3) { // Text node
                const match = node.nodeValue.match(regex);
                if (match) {
                    const span = document.createElement('span');
                    span.innerHTML = node.nodeValue.replace(regex, '<mark class="highlight">$1</mark>');
                    node.replaceWith.apply(node, span.childNodes);
                }
            }
            else if (node.nodeType === 1 && node.tagName === 'ARTICLE' || node.closest('article')) {
                node.childNodes.forEach(highlightSearchKey);
            }
        }

        // only search in article
        document.querySelectorAll('article').forEach(highlightSearchKey);
    });
}