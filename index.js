'use strict'

const { verifierFactory } = require('./src/verifier')
const JwksFetchError = require('./src/errors/jwks-fetch-error')
const JwtCognitoClaimValidationError = require('./src/errors/jwt-cognito-claim-validation-error')
const JwtVerificationError = require('./src/errors/jwt-verification-error')

module.exports = {
  verifierFactory,
  errors: {
    JwksFetchError,
    JwtCognitoClaimValidationError,
    JwtVerificationError,
  },
}
