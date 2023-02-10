import * as core from '@actions/core'
import * as exec from '@actions/exec'
import {run} from '../src/index'
import {createPullRequest} from '../src/github-helper'
import { PullRequest } from '@octokit/webhooks-definitions/schema'

const defaultMockedGetInputData: any = {
  token: 'whatever',
  author: 'Me <me@mail.com>',
  committer: 'Someone <someone@mail.com>',
  branch: 'target-branch',
  'cherry-pick-branch': ''
}

const mockedCreatePullRequestOutputData: any = {
  data: '{\n  "number" : "54"\n}'
}

let mockedGetInputData: any = defaultMockedGetInputData

// default mock
jest.mock('@actions/core', () => {
  return {
    info: jest.fn(),
    setFailed: jest.fn().mockImplementation(msg => {
      throw new Error(msg)
    }),
    // redirect to stdout
    startGroup: jest.fn().mockImplementation(console.log),
    endGroup: jest.fn(),
    getInput: jest.fn().mockImplementation((name: string) => {
      return name in mockedGetInputData ? mockedGetInputData[name] : ''
    }),
    setOutput: jest.fn().mockImplementation(() => {
      return mockedCreatePullRequestOutputData
    })
  }
})

jest.mock('@actions/exec', () => {
  return {
    // 0 -> success
    exec: jest.fn().mockResolvedValue(0)
  }
})

jest.mock('@actions/github', () => {
  return {
    context: {
      payload: {
        pull_request: {
          merge_commit_sha: 'XXXXXX'
        } as PullRequest
      }
    }
  }
})

jest.mock('../src/github-helper', () => {
  return {
    createPullRequest: jest.fn().mockImplementation(() => {
      return mockedCreatePullRequestOutputData
    })
  }
})

describe('run main', () => {
  beforeEach(() => {
    mockedGetInputData = defaultMockedGetInputData
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  const commonChecks = (targetBranch: string, cherryPickBranch: string) => {
    expect(core.startGroup).toBeCalledTimes(6)
    expect(core.startGroup).toHaveBeenCalledWith(
      'Configuring the committer and author'
    )
    expect(core.startGroup).toHaveBeenCalledWith('Fetch all branchs')
    expect(core.startGroup).toHaveBeenCalledWith(
      `Create new branch ${cherryPickBranch} from ${targetBranch}`
    )
    expect(core.startGroup).toHaveBeenCalledWith('Cherry picking')
    expect(core.startGroup).toHaveBeenCalledWith('Push new branch to remote')
    expect(core.startGroup).toHaveBeenCalledWith('Opening pull request')

    expect(core.endGroup).toBeCalledTimes(6)

    // TODO check params
    expect(exec.exec).toBeCalledTimes(7)

    // TODO check params
    expect(createPullRequest).toBeCalledTimes(1)
  }

  test('valid execution with default new branch', async () => {
    await run()

    commonChecks('target-branch', 'cherry-pick-target-branch-XXXXXX')

    expect(createPullRequest).toHaveBeenCalledWith(
      expect.objectContaining({
        author: 'Me <me@mail.com>',
        committer: 'Someone <someone@mail.com>',
        branch: 'target-branch',
        title: '',
        body: '',
        labels: [],
        reviewers: [],
        cherryPickBranch: ''
      }),
      'cherry-pick-target-branch-XXXXXX'
    )
  })

  test('valid execution with customized branch', async () => {
    mockedGetInputData['cherry-pick-branch'] = 'my-custom-branch'

    await run()

    commonChecks('target-branch', 'my-custom-branch')

    expect(createPullRequest).toHaveBeenCalledWith(
      expect.objectContaining({
        author: 'Me <me@mail.com>',
        committer: 'Someone <someone@mail.com>',
        branch: 'target-branch',
        title: '',
        body: '',
        labels: [],
        reviewers: [],
        cherryPickBranch: 'my-custom-branch'
      }),
      'my-custom-branch'
    )
  })

  test('valid execution with pr overrides', async () => {
    mockedGetInputData['cherry-pick-branch'] = 'my-custom-branch'
    mockedGetInputData['title'] = 'new title'
    mockedGetInputData['body'] = 'new body'
    mockedGetInputData['labels'] = 'label1,label2'
    mockedGetInputData['reviewers'] = 'user1,user2,user3'

    await run()

    commonChecks('target-branch', 'my-custom-branch')

    expect(createPullRequest).toHaveBeenCalledWith(
      expect.objectContaining({
        author: 'Me <me@mail.com>',
        committer: 'Someone <someone@mail.com>',
        branch: 'target-branch',
        title: 'new title',
        body: 'new body',
        labels: ['label1', 'label2'],
        reviewers: ['user1', 'user2', 'user3'],
        cherryPickBranch: 'my-custom-branch'
      }),
      'my-custom-branch'
    )
  })
})
