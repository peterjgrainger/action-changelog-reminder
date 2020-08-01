import {Context} from '@actions/github/lib/context'
import {existingComment} from './noDuplicateComment'
import {createComment} from './createComment'
import {fileMissing} from './fileMissing'
import {missingChangelogContent} from './missingChangelogContent'
import {Octokit} from '@octokit/core/dist-types'
import {RestEndpointMethods} from '@octokit/plugin-rest-endpoint-methods/dist-types/generated/method-types'

export async function changeLogReminder(
  octokit: Octokit & RestEndpointMethods,
  actionContext: Context,
  core: any // eslint-disable-line @typescript-eslint/no-explicit-any
): Promise<void> {
  try {
    const pr = actionContext.payload.pull_request

    if (!pr) {
      core.setFailed('This is not a pull request event')
      return
    }
    const isFileMissing = await fileMissing(
      octokit,
      actionContext,
      pr.number,
      core
    )
    const newMessage =
      core.getInput('customPrMessage') || missingChangelogContent(actionContext)
    const sameComment = await existingComment(
      octokit,
      actionContext,
      pr.number,
      newMessage
    )

    if (isFileMissing && sameComment.length === 0) {
      await createComment(
        octokit,
        actionContext,
        actionContext.issue.number,
        newMessage
      )
    } else if (sameComment.length > 0) {
      await Promise.all(
        sameComment.map(async comment => {
          await octokit.issues.deleteComment({
            ...actionContext.repo,
            comment_id: comment.id
          })
        })
      )
    } else {
      core.debug("changelog doesn't exist")
    }
  } catch (error) {
    core.setFailed(error)
  }
}
