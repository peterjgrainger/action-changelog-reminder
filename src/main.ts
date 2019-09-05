import { changeLogReminder } from './change-log-reminder';
import {GitHub, context} from '@actions/github'
import * as core from '@actions/core'

async function run() {
  await changeLogReminder(GitHub, context, core)
}

run();
