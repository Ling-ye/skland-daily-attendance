/** Show API error details without dumping response data or configured credentials. */
export function formatAccountError(error: unknown, tokens: string[]): string {
  const message = error instanceof Error ? error.message : String(error)
  const cause = error instanceof Error ? error.cause : undefined
  const details: string[] = []

  const redact = (value: string) => {
    for (const token of tokens) {
      if (token.trim())
        value = value.replaceAll(token.trim(), '[REDACTED]')
    }
    return value.replace(/[\r\n\t]/g, ' ')
  }

  if (cause && typeof cause === 'object') {
    const response = cause as Record<string, unknown>
    for (const key of ['status', 'code']) {
      if (typeof response[key] === 'number' && Number.isFinite(response[key]))
        details.push(`${key}=${response[key]}`)
    }
    for (const key of ['msg', 'message']) {
      if (typeof response[key] === 'string' && response[key])
        details.push(`${key}=${redact(response[key]).slice(0, 200)}`)
    }
  }

  return redact(message) + (details.length > 0 ? `（接口返回: ${details.join(', ')}）` : '')
}
