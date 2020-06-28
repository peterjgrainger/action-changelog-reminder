import { Context } from '@actions/github/lib/context';
import { noDuplicateComment } from './noDuplicateComment';
import { createComment } from './createComment';
import { fileMissing } from './fileMissing';
import { missingChangelogContent } from './missingChangelogContent';
import {Octokit} from '@octokit/core/dist-types'
import {RestEndpointMethods} from '@octokit/plugin-rest-endpoint-methods/dist-types/generated/method-types'

export async function changeLogReminder(octokit: Octokit & RestEndpointMethods, actionContext: Context, core: any) {
  try {
    const pr = actionContext.payload.pull_request;
    const isFileMissing = pr && await fileMissing(octokit, actionContext, pr.number, core);
    const newMessage = core.getInput('customPrMessage') || missingChangelogContent(actionContext);
    const hasNoDuplicateComment = pr && isFileMissing && await noDuplicateComment(octokit, actionContext, pr.number, newMessage);
    
    if(hasNoDuplicateComment ) {
      await createComment(octokit, actionContext, actionContext.issue.number, newMessage)
    } else {
      core.debug('PR or changelog doesn\'t exist');
    }
  } catch (error) {
    core.setFailed(error);
  }
}
