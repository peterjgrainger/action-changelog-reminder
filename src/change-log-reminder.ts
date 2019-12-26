import { Context } from '@actions/github/lib/context';
import { noDuplicateComment } from './noDuplicateComment';
import { createComment } from './createComment';
import { fileMissing } from './fileMissing';
import { githubToken } from './githubToken';
import { missingChangelogContent } from './missingChangelogContent';

export async function changeLogReminder(Github: any, actionContext: Context, core: any) {
  try {
    const octokit = new Github(githubToken())
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
    core.setFailed(error.message);
  }
}
