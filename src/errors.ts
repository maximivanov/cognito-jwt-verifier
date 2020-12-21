export class JwksFetchError extends Error {
  constructor(message: string) {
    super(`Failed to fetch key set JSON: ${message}`)

    this.name = this.constructor.name
  }
}

export class JwksNoMatchingKeyError extends Error {
  originalError: Error

  constructor(originalError: Error) {
    super(`Cannot find matching key in key set`)

    this.name = this.constructor.name
    this.originalError = originalError
  }
}

export class JwtCognitoClaimValidationError extends Error {
  claim: string

  constructor(claim: string, message: string) {
    super(`Claim "${claim}" validation failed: ${message}`)

    this.name = this.constructor.name
    this.claim = claim
  }
}

export class JwtVerificationError extends Error {
  originalError: Error

  constructor(originalError: Error) {
    super(`JWT verification failed: ${originalError.message}`)

    this.name = this.constructor.name
    this.originalError = originalError
  }
}
