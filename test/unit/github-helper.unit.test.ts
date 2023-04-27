import {buildBranchesFromLabels} from '../../src/github-helper'
import * as github from '@actions/github'

describe('buildBranchesFromLabels', () => {
  it('should build correct branches', () => {
    github.context.payload = {
      pull_request: {
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
        ],
        number: 200
      }
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
      allowUserToSpecifyBranchViaLabel: 'false',
      labelPatternRequirement: 'CP v',
      userBranchPrefix: 'v'
    }
    expect(buildBranchesFromLabels(inputs)).toStrictEqual(['v1.0.0', 'v2.0.0'])
  })
})
