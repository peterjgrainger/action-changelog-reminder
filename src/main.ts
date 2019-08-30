import * as core from '@actions/core';
import * as toolkit from '@actions/github';

async function run() {
  try {
    const myInput = core.getInput('myInput');
    const token = core.getInput('token')
    const octokit = new toolkit.GitHub(token)
    const context = toolkit.context
    console.dir(context)
    core.debug(`Hello ${myInput}`);
  } catch (error) {
    console.log('failed')
    core.setFailed(error.message);
  }
}

run();
