import { GitHub } from '@actions/github';
import { Context } from '@actions/github/lib/context';

export async function fileMissing(octokit: GitHub, actionContext: Context, prNumber: number): Promise<boolean> {
  const files = await octokit.pulls.listFiles({
    ...actionContext.repo,
    pull_number: prNumber
  });
  const changlelogFiles = files.data.filter(value => /change_log\/.*\/*.yml/.test(value.filename));
  return changlelogFiles.length === 0;
}
