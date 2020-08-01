import {Octokit} from '@octokit/core/dist-types'
import {IssuesListCommentsResponseData} from '@octokit/types'
import {RestEndpointMethods} from '@octokit/plugin-rest-endpoint-methods/dist-types/generated/method-types'
import {Context} from '@actions/github/lib/context'
export async function existingComment(
  octokit: Octokit & RestEndpointMethods,
  actionContext: Context,
  prNumber: number,
  newMessage: string
): Promise<IssuesListCommentsResponseData> {
  const comments = await octokit.issues.listComments({
    ...actionContext.repo,
    issue_number: prNumber
  })
  return comments.data.filter(comment => comment.body === newMessage)
}
