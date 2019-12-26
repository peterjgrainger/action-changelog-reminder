import { GitHub } from '@actions/github';
import { Context } from '@actions/github/lib/context';
export async function noDuplicateComment(octokit: GitHub, actionContext: Context, prNumber: number, newMessage: string): Promise<boolean> {
  const comments = await octokit.issues.listComments({
    ...actionContext.repo,
    issue_number: prNumber
  });
  return comments.data.filter(comment => comment.body === newMessage).length === 0;
}
