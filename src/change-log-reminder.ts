import { Context } from '@actions/github/lib/context';
import { noDuplicateComment } from './noDuplicateComment';
import { createComment } from './createComment';
import { fileMissing } from './fileMissing';
import { githubToken } from './githubToken';

export async function changeLogReminder(Github: any, actionContext: Context, core: any) {
  try {
    const octokit = new Github(githubToken())
    const pr = actionContext.payload.pull_request;
    if(pr && await fileMissing(octokit, actionContext, pr.number) && await noDuplicateComment(octokit, actionContext, pr.number)) {
      await createComment(octokit, actionContext, actionContext.issue.number)
    } else {
      core.debug('PR or changelog doesn\'t exist');
    }
  } catch (error) {
    core.setFailed(error.message);
  }
}


