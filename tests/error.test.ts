import assert from 'node:assert/strict'
// eslint-disable-next-line test/no-import-node-test -- Use Node's built-in runner without adding dependencies.
import { test } from 'node:test'
import { formatAccountError } from '../utils/error.ts'

test('reports OAuth status and message without response data', () => {
  const error = new Error('OAuth 验证失败', {
    cause: { status: 3, msg: '登录已失效', data: { token: 'private-token', uid: 'private-uid' } },
  })
  assert.equal(formatAccountError(error, []), 'OAuth 验证失败（接口返回: status=3, msg=登录已失效）')
})

test('redacts all configured credentials from messages', () => {
  const error = new Error('failed for token-a', {
    cause: { code: 401, message: 'token-a\n token-b token-a' },
  })
  assert.equal(
    formatAccountError(error, [' token-a ', 'token-b', '']),
    'failed for [REDACTED]（接口返回: code=401, message=[REDACTED]  [REDACTED] [REDACTED]）',
  )
})

test('handles network errors and non-Error throws', () => {
  assert.equal(formatAccountError(new Error('network failure'), []), 'network failure')
  assert.equal(formatAccountError('failed token-a', ['token-a']), 'failed [REDACTED]')
  assert.equal(formatAccountError(null, []), 'null')
})

test('ignores unexpected response shapes', () => {
  const error = new Error('failure', { cause: { status: 'secret', code: Number.NaN, msg: { token: 'secret' } } })
  assert.equal(formatAccountError(error, []), 'failure')
})

test('bounds server messages after redacting credentials', () => {
  const error = new Error('failure', { cause: { msg: `${'x'.repeat(190)}token-a${'y'.repeat(300)}` } })
  const output = formatAccountError(error, ['token-a'])
  assert.equal(output.includes('token-a'), false)
  assert.equal(output, `failure（接口返回: msg=${`${'x'.repeat(190)}[REDACTED]${'y'.repeat(300)}`.slice(0, 200)}）`)
})
