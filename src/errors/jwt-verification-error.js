'use strict'

class JwtVerificationError extends Error {
  constructor(originalError) {
    super(`JWT verification failed: ${originalError.message}`)

    this.name = this.constructor.name
    this.originalError = originalError
    Error.captureStackTrace(this, this.constructor)
  }
}

module.exports = JwtVerificationError
