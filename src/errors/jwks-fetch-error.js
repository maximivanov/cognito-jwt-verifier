'use strict'

class JwksFetchError extends Error {
  constructor(message) {
    super(`Failed to fetch key store JSON: ${message}`)

    this.name = this.constructor.name
    Error.captureStackTrace(this, this.constructor)
  }
}

module.exports = JwksFetchError
