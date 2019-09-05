import {GitHub, context} from '@actions/github';
import { changeLogReminder } from '../src/change-log-reminder'
import { Context } from '@actions/github/lib/context';
import {readFileSync} from 'fs'

describe('TODO - Add a test suite', () => {

  let githubMock: any;
  let contextMock: Context;
  let coreMock;
  let octokitMock;
  let apiParams;
  let changelogBody;
  let issue_number;
  const fileList = { data: ['file'] }
  const commentsList = { data: ['comment1', 'comment2'] }

  beforeEach(() => {
    process.env.GITHUB_TOKEN = 'token'
  })

  beforeEach(()=> {
    octokitMock = {
      pulls: {
        listFiles: jest.fn().mockReturnValue(Promise.resolve(fileList))
      },
      issues: {
        listComments: jest.fn().mockReturnValue(Promise.resolve(commentsList)),
        createComment: jest.fn()
      }
    }
  })

  beforeEach(()=> {
    githubMock = jest.fn().mockImplementation(() => {
      return octokitMock;
    })
  })

  beforeEach(() => {
    contextMock = JSON.parse(readFileSync('__tests__/context.json', 'utf8'))
  })

  beforeEach(() => {
    coreMock = {
      debug: jest.fn(),
      setFailed: jest.fn()
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

  describe('changelog file is missing', () => {
    it('checks if file is missing from PR', async () => {
      await changeLogReminder(githubMock, contextMock, coreMock)
      expect(octokitMock.pulls.listFiles).toHaveBeenCalledWith(apiParams)
    })
  
    it('checks if comment is already on PR', async () => {
      await changeLogReminder(githubMock, contextMock, coreMock)
      expect(octokitMock.pulls.listFiles).toHaveBeenCalledWith(apiParams)
    })

    it('creates a comment', async () => {
      await changeLogReminder(githubMock, contextMock, coreMock)
      expect(octokitMock.issues.createComment).toHaveBeenCalledWith({...changelogBody, issue_number, ...contextMock.repo})
    })
  })

  describe('change log is in pr doesn\'t create comment', () => {
    it('when there is a changelog in next', async() => {
      const changelogInList = ['change_log/next/change.yml']
      octokitMock.pulls.listFiles.mockReturnValue(Promise.resolve(changelogInList))
      await changeLogReminder(githubMock, contextMock, coreMock)
      expect(octokitMock.issues.createComment).toHaveBeenCalledTimes(0)
    })

    it('when there is a changelog in releases', async() => {
      const changelogInList = ['change_log/v1.2.3/change.yml']
      octokitMock.pulls.listFiles.mockReturnValue(Promise.resolve(changelogInList))
      await changeLogReminder(githubMock, contextMock, coreMock)
      expect(octokitMock.issues.createComment).toHaveBeenCalledTimes(0)
    })
  })

  describe('doesn\'t create a comment', () => {
    it('comment already made', async() => {
      const comments = ['@peterjgrainger  your pull request is missing a changelog!']
      octokitMock.issues.listComments.mockReturnValue(Promise.resolve(comments))
      await changeLogReminder(githubMock, contextMock, coreMock)
      expect(octokitMock.issues.createComment).toHaveBeenCalledTimes(0)
    })

    it('no pull request', async () => {
      contextMock.payload.pull_request = undefined
      await changeLogReminder(githubMock, contextMock, coreMock)
      expect(octokitMock.issues.createComment).toHaveBeenCalledTimes(0)
    })

    it('no pull request also calls debug', async () => {
      contextMock.payload.pull_request = undefined
      await changeLogReminder(githubMock, contextMock, coreMock)
      expect(coreMock.debug).toHaveBeenCalledWith('PR or changelog doesn\'t exist')
    })
  })

  describe('setFailed called', () => {
    it('when there is no github token', async () => {
      githubMock = jest.fn().mockImplementation(() => {
        throw Error('some error')
      })
      await changeLogReminder(githubMock, contextMock, coreMock)
      expect(coreMock.setFailed).toHaveBeenCalledWith('some error')
    })

    it('when listFiles api fails', async() => {
      octokitMock.pulls.listFiles.mockRejectedValue(new Error('Async error'))
      await changeLogReminder(githubMock, contextMock, coreMock)
      expect(coreMock.setFailed).toHaveBeenCalledWith('Async error')
    })

    it('when listComments api fails', async() => {
      octokitMock.issues.listComments.mockRejectedValue(new Error('Async error'))
      await changeLogReminder(githubMock, contextMock, coreMock)
      expect(coreMock.setFailed).toHaveBeenCalledWith('Async error')
    })

    it('when create comment api fails', async() => {
      octokitMock.issues.createComment.mockRejectedValue(new Error('Async error'))
      await changeLogReminder(githubMock, contextMock, coreMock)
      expect(coreMock.setFailed).toHaveBeenCalledWith('Async error')
    })
  })
});
