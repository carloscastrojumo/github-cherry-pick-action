import * as core from '@actions/core'
import {Inputs} from './github-helper'

export function getInputAsArray(
  name: string,
  options?: core.InputOptions
): string[] {
  return getStringAsArray(core.getInput(name, options))
}

export function getStringAsArray(str: string): string[] {
  return str
    .split(/[\n,]+/)
    .map(s => s.trim())
    .filter(x => x !== '')
}

interface DisplayNameEmail {
  name: string
  email: string
}

export function parseDisplayNameEmail(
  displayNameEmail: string
): DisplayNameEmail {
  // Parse the name and email address from a string in the following format
  // Display Name <email@address.com>
  const pattern = /^([^<]+)\s*<([^>]+)>$/i

  // Check we have a match
  const match = displayNameEmail.match(pattern)
  if (!match) {
    throw new Error(
      `The format of '${displayNameEmail}' is not a valid email address with display name`
    )
  }

  // Check that name and email are not just whitespace
  const name = match[1].trim()
  const email = match[2].trim()
  if (!name || !email) {
    throw new Error(
      `The format of '${displayNameEmail}' is not a valid email address with display name`
    )
  }
  return {name, email}
}

export function validatelabelPatternRequirement(
  labelPatternRequirement: string,
  label: string
): string | undefined {
  const match = label.includes(labelPatternRequirement)
  if (match) return label
  else return undefined
}

export function parseBranchFromLabel(
  branchPrefix: string,
  label: string
): string {
  const versionMatchRegex = /[0-9]\d*(\.[0-9]\d*)*$/
  const version = label.match(versionMatchRegex)
  if (!version)
    throw new Error(
      'user did not specify release version or the release version is in an invalid format'
    )
  return `${branchPrefix}${version[0]}`
}

export function filterIrrelevantBranchLabels(
  inputs: Inputs,
  labels: string[],
  branch: string
): string[] {
  return labels.filter((label: string) => {
    if (!validatelabelPatternRequirement(inputs.labelPatternRequirement, label))
      return true
    else {
      const branchWithoutPrefix = branch.replace(inputs.userBranchPrefix, '')
      if (label.includes(branchWithoutPrefix)) return true
      else return false
    }
  })
}
