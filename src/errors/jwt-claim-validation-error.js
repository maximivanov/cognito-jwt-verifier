'use strict'

class JwtClaimValidationError extends Error {
  constructor(claim, message) {
    super(`Claim "${claim}" validation failed: ${message}`)

    this.name = this.constructor.name
    Error.captureStackTrace(this, this.constructor)
  }
}

module.exports = JwtClaimValidationError
