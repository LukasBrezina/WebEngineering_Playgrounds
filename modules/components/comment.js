export function initializeComments() {
    setupCommentButton();
    setupCommentForm();
}

function setupCommentButton() {
    // Show/hide comments toggle
    const showHideBtn = document.querySelector('.show-hide');
    const commentWrapper = document.querySelector('.comment-wrapper');
    let areCommentsVisible = false;

    console.log(commentWrapper)

    const render = () => {
        // toggles comment form via css
        commentWrapper.classList.toggle('active', areCommentsVisible)
        showHideBtn.textContent = areCommentsVisible ? 'Hide comments' : 'Show comments';
        showHideBtn.setAttribute('aria-expanded', String(areCommentsVisible));
    };

    render();

    showHideBtn.addEventListener('click', () => {
        areCommentsVisible = !areCommentsVisible;
        console.log(areCommentsVisible)
        render();
    });
}

function setupCommentForm() {
    // Comment form stuff
    const form = document.querySelector('.comment-form');
    const nameField = document.querySelector('#name');
    const commentField = document.querySelector('#comment');
    const list = document.querySelector('.comment-container');

    form.onsubmit = e => {
        e.preventDefault();
        const listItem = document.createElement('li');
        const namePara = document.createElement('p');
        const commentPara = document.createElement('p');
        const nameValue = nameField.value;
        const commentValue = commentField.value;

        if (!nameValue || !commentValue) {
            alert('Please fill in both fields: Name and Comment');
            console.log('Please fill in both fields');
            return;
        }

        namePara.textContent = nameValue;
        commentPara.textContent = commentValue;

        console.log(nameValue);

        list.appendChild(listItem);
        listItem.appendChild(namePara);
        listItem.appendChild(commentPara);

        nameField.value = '';
        commentField.value = '';
    };
}