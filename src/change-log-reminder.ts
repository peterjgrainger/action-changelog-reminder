import { Context } from '@actions/github/lib/context';
import { noDuplicateComment } from './noDuplicateComment';
import { createComment } from './createComment';
import { fileMissing } from './fileMissing';
import { githubToken } from './githubToken';

export async function changeLogReminder(Github: any, actionContext: Context, core: any) {
  try {
    core.debug('Authenticating with Github');
    const octokit = new Github(githubToken())
    const pr = actionContext.payload.pull_request;
    core.debug('Starting API calls');
    const fileIsMissing = pr && await fileMissing(octokit, actionContext, pr.number, core);
    core.debug('Is file missing? ' + fileIsMissing? 'yep' : 'nope');
    const commentIsNotDuplicate = pr && await noDuplicateComment(octokit, actionContext, pr.number)
    core.debug('Is comment not duplicate? ' + commentIsNotDuplicate? 'yep' : 'nope');
    if(fileIsMissing && commentIsNotDuplicate) {
      await createComment(octokit, actionContext, actionContext.issue.number)
      core.debug('Create comment successful? ' + commentIsNotDuplicate? 'yep' : 'nope');
    } else {
      core.debug('PR or changelog doesn\'t exist');
    }
  } catch (error) {
    core.setFailed(error);
  }
}
