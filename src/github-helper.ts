import * as github from '@actions/github'
import * as core from '@actions/core'

const ERROR_PR_REVIEW_FROM_AUTHOR =
  'Review cannot be requested from pull request author'

export interface Inputs {
  token: string
  committer: string
  author: string
  branch: string
  title?: string
  body?: string
  labels: string[]
  inherit_labels?: boolean
  assignees: string[]
  reviewers: string[]
  teamReviewers: string[]
  GITHUB_SHA : string
}

export async function createPullRequest(
  inputs: Inputs,
  prBranch: string
): Promise<void> {
  const octokit = github.getOctokit(inputs.token)
  if (process.env.GITHUB_REPOSITORY !== undefined) {
    const [owner, repo] = process.env.GITHUB_REPOSITORY.split('/')

    // Get PR title
    core.info(`Input title is '${inputs.title}'`)
    let title = inputs.title
    if (title === undefined || title === '') {
      title =
        github.context.payload &&
        github.context.payload.pull_request &&
        github.context.payload.pull_request.title
    }
    core.info(`Using title '${title}'`)

    // Get PR body
    core.info(`Input body is '${inputs.body}'`)
    let body = inputs.body
    if (body === undefined || body === '') {
      body =
        github.context.payload &&
        github.context.payload.pull_request &&
        github.context.payload.pull_request.body
    }
    core.info(`Using body '${body}'`)

    // Create PR
    const pull = await octokit.pulls.create({
      owner,
      repo,
      head: prBranch,
      base: inputs.branch,
      title,
      body
    })

    // Apply labels
    const appliedLabels = inputs.labels

    if (inputs.inherit_labels) {
      const prLabels =
        github.context.payload &&
        github.context.payload.pull_request &&
        github.context.payload.pull_request.labels
      if (prLabels) {
        for (const item of prLabels) {
          if (item.name !== inputs.branch) {
            appliedLabels.push(item.name)
          }
        }
      }
    }
    if (appliedLabels.length > 0) {
      core.info(`Applying labels '${appliedLabels}'`)
      await octokit.issues.addLabels({
        owner,
        repo,
        issue_number: pull.data.number,
        labels: appliedLabels
      })
    }

    // Apply assignees
    if (inputs.assignees.length > 0) {
      core.info(`Applying assignees '${inputs.assignees}'`)
      await octokit.issues.addAssignees({
        owner,
        repo,
        issue_number: pull.data.number,
        assignees: inputs.assignees
      })
    }

    // Request reviewers and team reviewers
    try {
      if (inputs.reviewers.length > 0) {
        core.info(`Requesting reviewers '${inputs.reviewers}'`)
        await octokit.pulls.requestReviewers({
          owner,
          repo,
          pull_number: pull.data.number,
          reviewers: inputs.reviewers
        })
      }
      if (inputs.teamReviewers.length > 0) {
        core.info(`Requesting team reviewers '${inputs.teamReviewers}'`)
        await octokit.pulls.requestReviewers({
          owner,
          repo,
          pull_number: pull.data.number,
          team_reviewers: inputs.teamReviewers
        })
      }
    } catch (e) {
      if (e.message && e.message.includes(ERROR_PR_REVIEW_FROM_AUTHOR)) {
        core.warning(ERROR_PR_REVIEW_FROM_AUTHOR)
      } else {
        throw e
      }
    }
  }
}
