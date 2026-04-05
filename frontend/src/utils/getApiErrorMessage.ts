import { isAxiosError } from 'axios'

/** Turns ASP.NET ProblemDetails / validation responses into a single user-facing string. */
export function getApiErrorMessage(error: unknown): string {
  if (isAxiosError(error)) {
    const data = error.response?.data
    if (typeof data === 'string' && data.trim()) return data.trim()

    if (data && typeof data === 'object') {
      const o = data as Record<string, unknown>
      if (typeof o.message === 'string' && o.message.trim()) return o.message.trim()
      const errors = o.errors
      if (errors && typeof errors === 'object' && !Array.isArray(errors)) {
        const messages = Object.values(errors).flatMap((v) =>
          Array.isArray(v) ? v.map((x) => String(x)) : [String(v)]
        )
        const joined = messages.filter(Boolean).join(' ')
        if (joined) return joined
      }
      if (typeof o.detail === 'string' && o.detail.trim()) return o.detail.trim()
      if (typeof o.title === 'string' && o.title.trim()) return o.title.trim()
    }

    if (error.message) return error.message
  }
  if (error instanceof Error) return error.message
  return 'Something went wrong while saving. Please try again.'
}
