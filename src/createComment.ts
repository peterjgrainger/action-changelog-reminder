import { GitHub } from '@actions/github';
import { Context } from '@actions/github/lib/context';
import { missingChangelogContent } from "./missingChangelogContent";

export async function createComment(octokit: GitHub, actionContext: Context, issueNumber: number): Promise<void> {
    await octokit.issues.createComment({
      ...actionContext.repo,
      issue_number: issueNumber,
      body: missingChangelogContent(actionContext)
    });
}
