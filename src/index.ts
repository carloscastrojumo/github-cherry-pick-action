import * as core from '@actions/core'
import * as io from '@actions/io'
import * as exec from '@actions/exec'
import * as utils from './utils'
import {
  Inputs,
  createPullRequest,
  buildBranchesFromLabels
} from './github-helper'
import _ from 'lodash'

const CHERRYPICK_EMPTY =
  'The previous cherry-pick is now empty, possibly due to conflict resolution.'

export type ExecutionStatus = {
  failed: boolean
  branch: string
  inputs?: Inputs
  msg?: string | undefined | void
}

export type Statuses = {
  completedCherryPicks: ExecutionStatus[]
  cherryPickErrors: ExecutionStatus[]
}

export async function run(): Promise<void> {
  const inputs: Inputs = {
    token: core.getInput('token'),
    committer: core.getInput('committer'),
    author: core.getInput('author'),
    branch: core.getInput('branch'),
    labels: utils.getInputAsArray('labels'),
    assignees: utils.getInputAsArray('assignees'),
    reviewers: utils.getInputAsArray('reviewers'),
    teamReviewers: utils.getInputAsArray('teamReviewers'),
    allowUserToSpecifyBranchViaLabel:
      core.getInput('allowUserToSpecifyBranchViaLabel') || '',
    labelPatternRequirement: core.getInput('labelPatternRequirement'),
    userBranchPrefix: core.getInput('userBranchPrefix') || ''
  }

  const branchesToCherryPick = findBranchesToCherryPick(inputs)
  if (!branchesToCherryPick) {
    core.info('No branches to cherry pick')
    return
  }

  core.info(`branches to cherry pick ${JSON.stringify(branchesToCherryPick)}`)

  const executions: ExecutionStatus[] = []

  core.info(`Executing ${executions.length} cherry picks...`)

  for (const branch of branchesToCherryPick) {
    try {
      executions.push(await cherryPickExecution(inputs, branch))
    } catch (e: any) {
      executions.push(e)
    }
  }

  const {completedCherryPicks, cherryPickErrors} = filterExecutionStatuses(
    executions
  )

  core.info(`Finished cherry picking ${JSON.stringify(completedCherryPicks)}!`)
  core.info(`Failed to cherry pick ${JSON.stringify(cherryPickErrors)}`)
}

export function filterExecutionStatuses(statuses: ExecutionStatus[]): Statuses {
  const completedCherryPicks = statuses.filter(status => {
    if (status.failed === false) return true
  })
  const cherryPickErrors = statuses.filter(status => {
    return status.failed
  })
  return {
    completedCherryPicks,
    cherryPickErrors
  }
}

export function findBranchesToCherryPick(inputs: Inputs): string[] | undefined {
  const branchesToCherryPick =
    inputs.allowUserToSpecifyBranchViaLabel === 'true'
      ? buildBranchesFromLabels(inputs)
      : [inputs.branch]
  if (
    !branchesToCherryPick ||
    _.isEmpty(branchesToCherryPick) ||
    branchesToCherryPick[0] === ''
  ) {
    return undefined
  }
  return branchesToCherryPick
}

async function cherryPickExecution(
  inputs: Inputs,
  branch: string
): Promise<ExecutionStatus> {
  try {
    core.info(`Cherry pick into branch ${branch}!`)

    const githubSha = process.env.GITHUB_SHA
    const prBranch = `cherry-pick-${branch}-${githubSha}`

    // Configure the committer and author
    core.startGroup('Configuring the committer and author')
    const parsedAuthor = utils.parseDisplayNameEmail(inputs.author)
    const parsedCommitter = utils.parseDisplayNameEmail(inputs.committer)
    core.info(
      `Configured git committer as '${parsedCommitter.name} <${parsedCommitter.email}>'`
    )
    await gitExecution(['config', '--global', 'user.name', parsedAuthor.name])
    await gitExecution([
      'config',
      '--global',
      'user.email',
      parsedCommitter.email
    ])
    core.endGroup()

    // Update  branches
    core.startGroup('Fetch all branches')
    await gitExecution(['remote', 'update'])
    await gitExecution(['fetch', '--all'])
    core.endGroup()

    // Create branch new branch
    core.startGroup(`Create new branch from ${branch}`)
    await gitExecution(['checkout', '-b', prBranch, `origin/${branch}`])
    core.endGroup()

    // Cherry pick
    core.startGroup('Cherry picking')
    const result = await gitExecution([
      'cherry-pick',
      '-m',
      '1',
      '--strategy=recursive',
      '--strategy-option=theirs',
      `${githubSha}`
    ])
    if (result.exitCode !== 0 && !result.stderr.includes(CHERRYPICK_EMPTY)) {
      throw new Error(`Unexpected error: ${result.stderr}`)
    }
    core.endGroup()

    // Push new branch
    core.startGroup('Push new branch to remote')
    await gitExecution(['push', '-u', 'origin', `${prBranch}`])
    core.endGroup()

    // Create pull request
    core.startGroup('Opening pull request')
    await createPullRequest(inputs, prBranch, branch)
    core.endGroup()
    return {branch, failed: false}
  } catch (error: any) {
    return {
      branch,
      failed: true,
      inputs,
      msg: core.setFailed(error.message)
    }
  }
}

async function gitExecution(params: string[]): Promise<GitOutput> {
  const result = new GitOutput()
  const stdout: string[] = []
  const stderr: string[] = []

  const options = {
    listeners: {
      stdout: (data: Buffer) => {
        stdout.push(data.toString())
      },
      stderr: (data: Buffer) => {
        stderr.push(data.toString())
      }
    }
  }

  const gitPath = await io.which('git', true)
  result.exitCode = await exec.exec(gitPath, params, options)
  result.stdout = stdout.join('')
  result.stderr = stderr.join('')

  if (result.exitCode === 0) {
    core.info(result.stdout.trim())
  } else {
    core.info(result.stderr.trim())
  }

  return result
}

class GitOutput {
  stdout = ''
  stderr = ''
  exitCode = 0
}

run()
