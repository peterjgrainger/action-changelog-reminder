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
  core: {
    getInput: (arg0: string) => string
    setFailed: (arg0: string) => void
    debug: (arg0: string) => void
  }
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

    // The file is missing and there isn't already a comment in PR
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
