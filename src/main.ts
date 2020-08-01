import {changeLogReminder} from './change-log-reminder'
import * as GitHub from '@actions/github'
import {context} from '@actions/github'
import * as core from '@actions/core'

async function run(): Promise<void> {
  const token = process.env.GITHUB_TOKEN
  if (!token)
    throw new Error('GITHUB_TOKEN environment variable not set. Read the docs.')
  await changeLogReminder(GitHub.getOctokit(token), context, core)
}

run()
