import { ForbiddenError } from '../errors/errors.js';
import type { Comment } from '../models/comments.js';
import { ROLE_MODERATOR, type User } from '../models/users.js';

// author of comment or moderator can delete comment
export const assertCanDeleteComment = (user: User, comment: Comment): void => {
  if (user.role !== ROLE_MODERATOR && comment.authorId !== user.id)
    throw new ForbiddenError(
      'Only the author or a moderator can delete this comment'
    );
};
