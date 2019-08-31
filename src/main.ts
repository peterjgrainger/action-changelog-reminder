import * as core from '@actions/core';
import * as toolkit from '@actions/github';

async function run() {
  try {
    const octokit = new toolkit.GitHub(token())
    const pr = toolkit.context.payload.pull_request;

    if(pr && changeLogExists(octokit, pr)) {
      createComment(octokit)
    } else {
      core.debug('PR or changelog doesn\'t exist');
    }
  } catch (error) {
    core.setFailed(error.message);
  }
}

async function changeLogExists(octokit, pr) {
  const files = await octokit.pulls.listFiles({
    ...toolkit.context.repo,
    pull_number: pr.number
  })
  const changlelogFiles = files.data.filter(value => /change_log\/next\/*.yml/.test(value.filename))

  return changlelogFiles.length === 0
}

async function createComment(octokit) {
  await octokit.issues.createComment({
    ...toolkit.context.repo,
    issue_number: toolkit.context.issue.number,
    body: `@${toolkit.context.actor} your pull request is missing a changelog!`
  })
}

function token() {
  const token  = process.env.GITHUB_TOKEN
  if(!token) throw ReferenceError('No token defined in the environment variables')

  return token
}

run();
