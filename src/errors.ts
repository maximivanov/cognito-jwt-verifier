export class JwtCognitoClaimValidationError extends Error {
  claim: string

  constructor(claim: string, message: string) {
    super(`Claim "${claim}" validation failed: ${message}`)

    this.name = this.constructor.name
    this.claim = claim
  }
}
