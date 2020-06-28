import { Context } from '@actions/github/lib/context';
import {Octokit} from '@octokit/core/dist-types'
import {RestEndpointMethods} from '@octokit/plugin-rest-endpoint-methods/dist-types/generated/method-types'

export async function createComment(octokit: Octokit & RestEndpointMethods, actionContext: Context, issueNumber: number, newMessage: string): Promise<void> {
  await octokit.issues.createComment({
    ...actionContext.repo,
    issue_number: issueNumber,
    body: newMessage
  });
}
