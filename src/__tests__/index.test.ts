import { describe, it, expect } from 'vitest'
import { hello } from '../lib/index'

describe('hello function', () => {
  it('should return a greeting message', () => {
    const result = hello('World')
    expect(result).toBe('Hello, World!')
  })

  it('should handle empty string', () => {
    const result = hello('')
    expect(result).toBe('Hello, !')
  })
})

// Add more tests as you develop your library
