import { changeLogReminder } from '../src/change-log-reminder'
import { Context } from '@actions/github/lib/context';
import {readFileSync} from 'fs'
import * as GitHub from '@actions/github'
import {
  OctokitResponse,
  PullsListFilesResponseData,
  IssuesListCommentsResponseData,
  IssuesCreateCommentResponseData
} from '@octokit/types'

describe('Change Log Reminder Test', () => {

  let octokitMock = GitHub.getOctokit('fake-token')
  let contextMock: Context;
  let coreMock;
  let apiParams;
  let changelogBody;
  let issue_number;
  let customRegexInput;
  let customPrMessage;
  const fileList = { data: [{filename: 'file'}] } as OctokitResponse<PullsListFilesResponseData>
  const commentsList = { data: [{body: 'some comment'}] } as OctokitResponse<IssuesListCommentsResponseData>

  beforeEach(()=> {
    jest.spyOn(octokitMock.pulls, 'listFiles').mockResolvedValue(fileList)
    jest.spyOn(octokitMock.issues, 'listComments').mockResolvedValue(commentsList)
    jest.spyOn(octokitMock.issues, 'createComment').mockResolvedValue({} as OctokitResponse<IssuesCreateCommentResponseData>)
  })

  beforeEach(() => {
    contextMock = JSON.parse(readFileSync('__tests__/context.json', 'utf8'))
  })

  beforeEach(() => {
    customPrMessage = undefined;
    customRegexInput = undefined;
  })

  beforeEach(() => {
    coreMock = {
      debug: jest.fn(),
      setFailed: jest.fn(),
      getInput: jest.fn(actionInput => {
        if(actionInput === 'changelog_regex') {
          return customRegexInput;
        } else if(actionInput === 'customPrMessage') {
          return customPrMessage;
        } else {
          throw new Error('Input not implemented')
        }
      }),
    }

    if(contextMock.payload.pull_request) {
      apiParams = {
        ...contextMock.repo,
        pull_number: contextMock.payload.pull_request.number
      }
    }

    changelogBody = {
      body: "@peterjgrainger your pull request is missing a changelog!"
    }

    issue_number = contextMock.issue.number;
  })

  describe('default regex is used when no changelog_regex is provided', () => {
    it('checks changelog_regex input anyway', async () => {
      await changeLogReminder(octokitMock, contextMock, coreMock)
      expect(coreMock.getInput).toBeCalledWith("changelog_regex")
    })
  })

  describe('custom changelog_regex is provided', () => {
    it('when there is a changelog matching the regex', async () => {
      customRegexInput = 'file';
      await changeLogReminder(octokitMock, contextMock, coreMock)
      expect(coreMock.getInput).toBeCalledWith("changelog_regex")
      expect(octokitMock.issues.createComment).toHaveBeenCalledTimes(0)
    })

    it('when there is no changelog matching the regex', async () => {
      customRegexInput = 'change';
      await changeLogReminder(octokitMock, contextMock, coreMock)
      expect(coreMock.getInput).toBeCalledWith("changelog_regex")
      expect(octokitMock.issues.createComment).toHaveBeenCalledWith({...changelogBody, issue_number, ...contextMock.repo})
    })
  })

  describe('when custom PR message is provided', () => {

    beforeEach(( () => {
      customPrMessage = 'some custom message';
    }))
    it('gets the input', async() => {
      await changeLogReminder(octokitMock, contextMock, coreMock);
      expect(coreMock.getInput).toBeCalledWith('customPrMessage')
    })
    
    it('adds a custom message to the PR if not there', async() => {
      const customBody = {
        body: customPrMessage
      }
      await changeLogReminder(octokitMock, contextMock, coreMock);
      expect(octokitMock.issues.createComment).toHaveBeenCalledWith({...customBody, issue_number, ...contextMock.repo})
    })

    it('does not add the same custom message twice', async() => {
      commentsList.data[0].body = customPrMessage
      await changeLogReminder(octokitMock, contextMock, coreMock)
      expect(octokitMock.issues.createComment).toHaveBeenCalledTimes(0)
    })
  })

  describe('changelog file is missing', () => {
    it('checks if file is missing from PR', async () => {
      await changeLogReminder(octokitMock, contextMock, coreMock)
      expect(octokitMock.pulls.listFiles).toHaveBeenCalledWith(apiParams)
    })

    it('checks if comment is already on PR', async () => {
      await changeLogReminder(octokitMock, contextMock, coreMock)
      expect(octokitMock.pulls.listFiles).toHaveBeenCalledWith(apiParams)
    })

    it('creates a comment', async () => {
      await changeLogReminder(octokitMock, contextMock, coreMock)
      expect(octokitMock.issues.createComment).toHaveBeenCalledWith({...changelogBody, issue_number, ...contextMock.repo})
    })
  })

  describe('change log is in pr doesn\'t create comment', () => {
    it('when there is a changelog in next', async() => {
      fileList.data[0].filename  = 'change_log/next/change.yml'
      await changeLogReminder(octokitMock, contextMock, coreMock)
      expect(octokitMock.issues.createComment).toHaveBeenCalledTimes(0)
    })

    it('when there is a changelog in releases', async() => {
      fileList.data[0].filename  = 'change_log/v1.2.3/change.yml'
      await changeLogReminder(octokitMock, contextMock, coreMock)
      expect(octokitMock.issues.createComment).toHaveBeenCalledTimes(0)
    })
  })

  describe('doesn\'t create a comment', () => {
    it('comment already made', async() => {
      commentsList.data[0].body = '@peterjgrainger  your pull request is missing a changelog!'
      await changeLogReminder(octokitMock, contextMock, coreMock)
      expect(octokitMock.issues.createComment).toHaveBeenCalledTimes(0)
    })

    it('no pull request', async () => {
      contextMock.payload.pull_request = undefined
      await changeLogReminder(octokitMock, contextMock, coreMock)
      expect(octokitMock.issues.createComment).toHaveBeenCalledTimes(0)
    })

    it('no pull request also calls debug', async () => {
      contextMock.payload.pull_request = undefined
      await changeLogReminder(octokitMock, contextMock, coreMock)
      expect(coreMock.debug).toHaveBeenCalledWith('PR or changelog doesn\'t exist')
    })
  })

  describe('setFailed called', () => {

    it('when listFiles api fails', async() => {
      jest.spyOn(octokitMock.pulls, 'listFiles').mockRejectedValue('Async error')
      await changeLogReminder(octokitMock, contextMock, coreMock)
      expect(coreMock.setFailed).toHaveBeenCalledWith('Async error')
    })
  })
});
