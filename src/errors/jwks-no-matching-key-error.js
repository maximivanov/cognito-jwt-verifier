'use strict'

class JwksNoMatchingKeyError extends Error {
  constructor(originalError) {
    super(`Cannot find matching key in key set`)

    this.name = this.constructor.name
    this.originalError = originalError
    Error.captureStackTrace(this, this.constructor)
  }
}

module.exports = JwksNoMatchingKeyError
