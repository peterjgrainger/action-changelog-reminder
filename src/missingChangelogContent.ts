import { Context } from '@actions/github/lib/context';
export function missingChangelogContent(actionContext: Context) {
  return `@${actionContext.actor} your pull request is missing a changelog!`;
}
