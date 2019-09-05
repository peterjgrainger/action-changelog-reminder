import { GitHub } from '@actions/github';
import { Context } from '@actions/github/lib/context';
import { missingChangelogContent } from "./missingChangelogContent";
export async function noDuplicateComment(octokit: GitHub, actionContext: Context, prNumber: number): Promise<boolean> {
  const comments = await octokit.issues.listComments({
    ...actionContext.repo,
    issue_number: prNumber
  });
  return comments.data.filter(comment => comment.body === missingChangelogContent(actionContext)).length === 0;
}
