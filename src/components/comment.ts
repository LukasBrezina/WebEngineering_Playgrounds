export function initializeComments(): void {
  setupCommentButton();
  setupCommentForm();
}

function setupCommentButton(): void {
  // Show/hide comments toggle
  const showHideBtn = document.querySelector<HTMLButtonElement>('.show-hide');
  const commentWrapper = document.querySelector('.comment-wrapper');
  let areCommentsVisible = false;

  if (showHideBtn == null || commentWrapper == null) {
    throw new Error('Required elements not found in the DOM');
  }

  const render = (): void => {
    // toggles comment form via css
    commentWrapper.classList.toggle('active', areCommentsVisible);
    showHideBtn.textContent = areCommentsVisible
      ? 'Hide comments'
      : 'Show comments';
    showHideBtn.setAttribute('aria-expanded', String(areCommentsVisible));
  };

  render();

  showHideBtn.addEventListener('click', () => {
    areCommentsVisible = !areCommentsVisible;
    render();
  });
}

function setupCommentForm(): void {
  // Comment form stuff
  const form = document.querySelector<HTMLFormElement>('.comment-form');
  const nameField = document.querySelector<HTMLInputElement>('#name');
  const commentField = document.querySelector<HTMLTextAreaElement>('#comment');
  const list = document.querySelector('.comment-container ul');

  if (
    form == null ||
    nameField == null ||
    commentField == null ||
    list == null
  ) {
    throw new Error('Required elements not found in the DOM');
  }

  // Consistency – use addEventListener as in every other file instead of property assignment (form.onsubmit...)
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const listItem = document.createElement('li');
    const namePara = document.createElement('p');
    const commentPara = document.createElement('p');
    const nameValue = nameField.value;
    const commentValue = commentField.value;

    if (
      nameValue == null ||
      commentValue == null ||
      nameValue.trim() === '' ||
      commentValue.trim() === ''
    ) {
      alert('Please fill in both fields: Name and Comment');
      return;
    }

    namePara.textContent = nameValue;
    commentPara.textContent = commentValue;

    list.appendChild(listItem);
    listItem.appendChild(namePara);
    listItem.appendChild(commentPara);

    nameField.value = '';
    commentField.value = '';
  });
}
