import {ExecutionStatus, filterExecutionStatuses} from '../../src'
describe('filterExecutionStatuses', () => {
  const Statuses = [
    {
      failed: false,
      branch: 'branch',
      inputs: {} as unknown,
      msg: 'test'
    },
    {
      failed: false,
      branch: 'branch',
      inputs: {} as unknown,
      msg: 'test'
    },
    {
      failed: true,
      branch: 'branch',
      inputs: {} as unknown,
      msg: 'test'
    }
  ]
  it('should filter correctly', () => {
    const {completedCherryPicks, cherryPickErrors} = filterExecutionStatuses(
      Statuses as unknown as ExecutionStatus[]
    )
    expect(completedCherryPicks.length).toBe(2)
    expect(cherryPickErrors.length).toBe(1)
  })
})
