export interface Comment {
    id: string;
    author: string;
    text: string;
    createdAt: string;
}

export const getComments = async (): Promise<Comment[]> => {
    const response = await fetch('/api/comments');

    if (!response.ok) {
        throw new Error('Could not load comments');
    }

    return response.json();
};

export const createComment = async (
    author: string,
    text: string
): Promise<Comment> => {
    const response = await fetch('/api/comments', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            author,
            text,
        }),
    });

    if (!response.ok) {
        throw new Error('Could not create comment');
    }

    return response.json();
};

export const deleteComment = async (
    commentId: string
): Promise<void> => {
    const response = await fetch(`/api/comments/${commentId}`, {
        method: 'DELETE',
    });

    if (!response.ok) {
        throw new Error('Could not delete comment');
    }
};