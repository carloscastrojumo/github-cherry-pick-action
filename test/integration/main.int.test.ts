import {findBranchesToCherryPick} from '../../src'
import * as github from '@actions/github'
describe('findBranchesToCherryPickMaybe', () => {
  it('should return array of strings', () => {
    github.context.payload.pull_request = {
      body: '',
      number: 1234,
      labels: [
        {
          color: 'A1F2AD',
          default: false,
          description: '',
          id: 4347407246,
          name: 'CP v1.0.0',
          node_id: 'LA_kwDOHsKN7M8AAAABAyArjg',
          url: 'https://api.github.com/repos/arivera-xealth/sample-repo/labels/CP%20v1.0.0'
        },
        {
          color: 'A1F2AD',
          default: false,
          description: '',
          id: 4347407246,
          name: 'CP v2.0.0',
          node_id: 'LA_kwDOHsKN7M8AAAABAyArjg',
          url: 'https://api.github.com/repos/arivera-xealth/sample-repo/labels/CP%20v1.0.0'
        }
      ]
    }
    const inputs = {
      token: '***',
      committer: 'GitHub <noreply@github.com>',
      author: 'arivera-xealth <arivera-xealth@users.noreply.github.com>',
      branch: '',
      labels: ['cherry-pick'],
      assignees: [],
      reviewers: ['aReviewerUser'],
      teamReviewers: [],
      allowUserToSpecifyBranchViaLabel: 'true',
      labelPatternRequirement: 'CP v',
      userBranchPrefix: 'v'
    }
    const test = findBranchesToCherryPick(inputs)
    expect(test).toStrictEqual(['v1.0.0', 'v2.0.0'])
  })
  it('should return undefined for no matching label', () => {
    github.context.payload.pull_request = {
      body: '',
      number: 1234,
      labels: [
        {
          color: 'A1F2AD',
          default: false,
          description: '',
          id: 4347407246,
          name: 'v1.0.0',
          node_id: 'LA_kwDOHsKN7M8AAAABAyArjg',
          url: 'https://api.github.com/repos/arivera-xealth/sample-repo/labels/CP%20v1.0.0'
        },
        {
          color: 'A1F2AD',
          default: false,
          description: '',
          id: 4347407246,
          name: 'v2.0.0',
          node_id: 'LA_kwDOHsKN7M8AAAABAyArjg',
          url: 'https://api.github.com/repos/arivera-xealth/sample-repo/labels/CP%20v1.0.0'
        }
      ]
    }
    const inputs = {
      token: '***',
      committer: 'GitHub <noreply@github.com>',
      author: 'arivera-xealth <arivera-xealth@users.noreply.github.com>',
      branch: '',
      labels: ['cherry-pick'],
      assignees: [],
      reviewers: ['aReviewerUser'],
      teamReviewers: [],
      allowUserToSpecifyBranchViaLabel: 'true',
      labelPatternRequirement: 'CP v',
      userBranchPrefix: 'v'
    }
    const test = findBranchesToCherryPick(inputs)
    expect(test).toStrictEqual(undefined)
  })
  it('should return undefined for no labels at all', () => {
    github.context.payload.pull_request = {
      body: '',
      number: 1234,
      labels: []
    }
    const inputs = {
      token: '***',
      committer: 'GitHub <noreply@github.com>',
      author: 'arivera-xealth <arivera-xealth@users.noreply.github.com>',
      branch: '',
      labels: ['cherry-pick'],
      assignees: [],
      reviewers: ['aReviewerUser'],
      teamReviewers: [],
      allowUserToSpecifyBranchViaLabel: 'true',
      labelPatternRequirement: 'CP v',
      userBranchPrefix: 'v'
    }
    const test = findBranchesToCherryPick(inputs)
    expect(test).toStrictEqual(undefined)
  })
  it('should return 1 branch for only branch config', () => {
    github.context.payload.pull_request = {
      body: '',
      number: 1234,
      labels: []
    }
    const inputs = {
      token: '***',
      committer: 'GitHub <noreply@github.com>',
      author: 'arivera-xealth <arivera-xealth@users.noreply.github.com>',
      branch: 'release-1.0.0',
      labels: ['cherry-pick'],
      assignees: [],
      reviewers: ['aReviewerUser'],
      teamReviewers: [],
      allowUserToSpecifyBranchViaLabel: 'false',
      labelPatternRequirement: 'CP v',
      userBranchPrefix: 'v'
    }
    const test = findBranchesToCherryPick(inputs)
    expect(test).toStrictEqual(['release-1.0.0'])
  })
})
