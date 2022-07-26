import {
  parseBranchFromLabel,
  validatelabelPatternRequirement,
  filterIrrelevantBranchLabels
} from '../src/utils'

import {Inputs} from '../src/github-helper'

describe('parseBranchFromLabel', () => {
  it('should parse version from label', () => {
    let test = 'CP v1.0.0'
    expect(parseBranchFromLabel('v', test)).toBe('v1.0.0')
    test = 'CP v1.0.1'
    expect(parseBranchFromLabel('v', test)).toBe('v1.0.1')
    test = 'CP v1.0'
    expect(parseBranchFromLabel('v', test)).toBe('v1.0')
    test = 'CP v1.10.1'
    expect(parseBranchFromLabel('v', test)).toBe('v1.10.1')
    test = 'CP v10.10.1'
    expect(parseBranchFromLabel('v', test)).toBe('v10.10.1')
    test = 'CP v5.14.2'
    expect(parseBranchFromLabel('v', test)).toBe('v5.14.2')
    test = 'CP v5'
    expect(parseBranchFromLabel('v', test)).toBe('v5')
    test = 'CP 5'
    expect(parseBranchFromLabel('', test)).toBe('5')
    test = 'Cherry pick 0.1.1'
    expect(parseBranchFromLabel('', test)).toBe('0.1.1')
    test = 'Cherry pick 0.1.1'
    expect(parseBranchFromLabel('release-v', test)).toBe('release-v0.1.1')
  })
  it('should throw error', () => {
    const test = 'CP 1209.'
    expect(() => {
      parseBranchFromLabel('', test)
    }).toThrowError()
  })
})

describe('validatelabelPatternRequirement', () => {
  it('should validate against pattern', () => {
    const requirement = 'CP v'
    const testLabel = 'CP v1.0.0'
    expect(validatelabelPatternRequirement(requirement, testLabel)).toBe(
      testLabel
    )
  })
  it('should return undefined', () => {
    const requirement = 'CP v'
    const testLabel = 'other random label'
    expect(validatelabelPatternRequirement(requirement, testLabel)).toBe(
      undefined
    )
  })
})

describe('filterIrrelevantBranchLabels', () => {
  it('should filter correctly', () => {
    const inputs = {
      userBranchPrefix: 'v',
      labelPatternRequirement: 'CP v'
    }
    const testLabels = [
      'CP v1.0.0',
      'CP v1.0.1',
      'CP v2.0.0',
      'other random label',
      'etc'
    ]
    const branch = 'v1.0.1'
    const test = filterIrrelevantBranchLabels(
      inputs as Inputs,
      testLabels,
      branch
    )
    expect(test).toStrictEqual(['CP v1.0.1', 'other random label', 'etc'])
  })
})
