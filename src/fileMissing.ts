import { GitHub } from '@actions/github';
import { Context } from '@actions/github/lib/context';

const default_regex = /change_log\/.*\/*.yml/;

export async function fileMissing(octokit: GitHub, actionContext: Context, prNumber: number, core: any): Promise<boolean> {
  const regex_str = core.getInput("changelog_regex");
  const regex = regex_str ? new RegExp(regex_str) : default_regex;
  const files = await octokit.pulls.listFiles({
    ...actionContext.repo,
    pull_number: prNumber
  });
  const changlelogFiles = files.data.filter(value => regex.test(value.filename));
  return changlelogFiles.length === 0;
}
