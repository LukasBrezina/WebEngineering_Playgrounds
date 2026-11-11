import { API_BASE_URL, checkResponseOk } from './api';

export interface Comment {
  id: string;
  bearId: string;
  author: string;
  text: string;
  createdAt: string;
}

const bearCommentsUrl = (bearId: string): string =>
  `${API_BASE_URL}/api/bears/${encodeURIComponent(bearId)}/comments`;

export const getComments = async (bearId: string): Promise<Comment[]> => {
  const response = await fetch(bearCommentsUrl(bearId));
  await checkResponseOk(response);
  return (await response.json()) as Comment[];
};

export const createComment = async (
  bearId: string,
  author: string,
  text: string
): Promise<Comment> => {
  const response = await fetch(bearCommentsUrl(bearId), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ author, text }),
  });
  await checkResponseOk(response);
  return (await response.json()) as Comment;
};

export const deleteComment = async (commentId: string): Promise<void> => {
  const response = await fetch(
    `${API_BASE_URL}/api/comments/${encodeURIComponent(commentId)}`,
    { method: 'DELETE' }
  );
  await checkResponseOk(response);
};
