import { NotFoundError } from '../errors/errors.js';
import type { CommentRepository, ReportState } from '../repositories/types.js';

const REPORTS_UNTIL_HIDDEN = 3;

const addReport = (state: ReportState): ReportState => {
  const reportCount = state.reportCount + 1;
  return {
    id: state.id,
    reportCount,
    hiddenAt:
      state.hiddenAt ??
      (reportCount >= REPORTS_UNTIL_HIDDEN ? new Date() : null),
  };
};

export interface CommentService {
  reportNaive: (id: string) => Promise<ReportState>;
  report: (id: string) => Promise<ReportState>;
}

export const createCommentService = (
  comments: CommentRepository
): CommentService => ({
  // NAIVE (lost update): read, increment in TypeScript, write.
  // No transaction and no lock: concurrent requests read the same old value,
  // and the last write overwrites the others.
  reportNaive: async (id) => {
    const state = await comments.findReportState(id);
    if (state === undefined) throw new NotFoundError('Comment');
    const next = addReport(state);
    await comments.saveReportState(next);
    return next;
  },

  // FIXED: the service opens one transaction around read and write.
  // SELECT ... FOR UPDATE locks the row until COMMIT, so a concurrent report
  // waits and then reads the already incremented value.
  report: async (id) =>
    await comments.transaction(async (tx) => {
      const state = await tx.findReportStateForUpdate(id);
      if (state === undefined) throw new NotFoundError('Comment');
      const next = addReport(state);
      await tx.saveReportState(next);
      return next;
    }),
});
