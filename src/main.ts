import * as core from '@actions/core';

async function run() {
  try {
    const myInput = core.getInput('myInput');
    console.log('hello!!!')
    core.debug(`Hello ${myInput}`);
  } catch (error) {
    console.log('failed')
    core.setFailed(error.message);
  }
}

run();
