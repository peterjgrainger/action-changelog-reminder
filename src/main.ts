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
      console.dir(files.data.join(','))
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
