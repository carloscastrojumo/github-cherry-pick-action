import {filterExecutionStatuses} from '../../src'
describe('filterExecutionStatuses', () => {
  const Statuses = [
    {
      failed: false,
      branch: 'branch',
      inputs: {} as any,
      msg: 'test'
    },
    {
      failed: false,
      branch: 'branch',
      inputs: {} as any,
      msg: 'test'
    },
    {
      failed: true,
      branch: 'branch',
      inputs: {} as any,
      msg: 'test'
    }
  ]
  it('should filter correctly', () => {
    const {completedCherryPicks, cherryPickErrors} = filterExecutionStatuses(
      Statuses
    )
    expect(completedCherryPicks.length).toBe(2)
    expect(cherryPickErrors.length).toBe(1)
  })
})
