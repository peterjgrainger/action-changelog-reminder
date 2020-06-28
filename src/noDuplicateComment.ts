import {Octokit} from '@octokit/core/dist-types'
import {RestEndpointMethods} from '@octokit/plugin-rest-endpoint-methods/dist-types/generated/method-types'
import { Context } from '@actions/github/lib/context';
export async function noDuplicateComment(octokit: Octokit & RestEndpointMethods, actionContext: Context, prNumber: number, newMessage: string): Promise<boolean> {
  const comments = await octokit.issues.listComments({
    ...actionContext.repo,
    issue_number: prNumber
  });
  return comments.data.filter(comment => comment.body === newMessage).length === 0;
}
