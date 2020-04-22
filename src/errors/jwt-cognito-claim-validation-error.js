'use strict'

class JwtCognitoClaimValidationError extends Error {
  constructor(claim, message) {
    super(`Claim "${claim}" validation failed: ${message}`)

    this.name = this.constructor.name
    this.claim = claim
    Error.captureStackTrace(this, this.constructor)
  }
}

module.exports = JwtCognitoClaimValidationError
