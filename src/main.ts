import * as core from '@actions/core';
import * as toolkit from '@actions/github';

async function run() {
  try {
    const myInput = core.getInput('myInput');
    const token = process.env.GITHUB_TOKEN || ''
    const octokit = new toolkit.GitHub(token)
    const context = toolkit.context

    const pr = context.payload.pull_request;

    if(pr) {
      console.dir(pr.number);
      const files = await octokit.pulls.listFiles({
        ...context.repo,
        pull_number: pr.number
      })
      console.log('join files')
      const changlelogFiles = files.data.filter(value => /change_log\/next\/*.yml/.test(value.filename))
      if(changlelogFiles.length < 0) {
        await octokit.issues.createComment({
          ...context.repo,
          issue_number: context.issue.number,
          body: 'You forget to add a changelog!'
        })
      }
    } else {
      console.log('no pr')
    }
    
    core.debug(`Hello ${myInput}`);
  } catch (error) {
    console.log('failed')
    core.setFailed(error.message);
  }
}

run();
