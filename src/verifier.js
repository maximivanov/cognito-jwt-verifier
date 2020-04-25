'use strict'

const {
  JWT,
  errors: { JOSEError },
} = require('jose')
const jwks = require('./util/jwks')
const { requireString } = require('./util/validators')
const {
  JwtCognitoClaimValidationError,
  JwtVerificationError,
  JwksNoMatchingKeyError,
} = require('./errors')

function handleVerificationError(e) {
  if (
    e instanceof JOSEError &&
    ['ERR_JWT_CLAIM_INVALID', 'ERR_JWT_EXPIRED', 'ERR_JWT_MALFORMED'].includes(
      e.code,
    )
  ) {
    throw new JwtVerificationError(e)
  }

  if (isNoMatchingKeyError(e)) {
    throw new JwksNoMatchingKeyError(e)
  }

  throw e
}

function isNoMatchingKeyError(e) {
  return e instanceof JOSEError && e.code === 'ERR_JWKS_NO_MATCHING_KEY'
}

function validateTokenUseClaim(payload, tokenType) {
  if (!payload.token_use || payload.token_use !== tokenType) {
    const originalError = new JwtCognitoClaimValidationError(
      'token_use',
      `expected "${tokenType}", got "${payload.token_use}"`,
    )

    throw new JwtVerificationError(originalError)
  }
}

function verifierFactory({ region, userPoolId, appClientId, tokenType }) {
  requireString(region, 'region')
  requireString(userPoolId, 'userPoolId')
  requireString(appClientId, 'appClientId')
  if (!['id', 'access'].includes(tokenType)) {
    throw new TypeError('"tokenType" must be either "id" or "access"')
  }

  const keyStoreUrl = `https://cognito-idp.${region}.amazonaws.com/${userPoolId}/.well-known/jwks.json`
  const joseOptions = {
    profile: tokenType === 'id' ? 'id_token' : undefined,
    audience: tokenType === 'id' ? appClientId : undefined,
    issuer: `https://cognito-idp.${region}.amazonaws.com/${userPoolId}`,
  }

  let keyStore

  return {
    verify: async (token) => {
      requireString(token, 'token')

      const isCachedKeyStore = keyStore !== undefined
      if (!isCachedKeyStore) {
        keyStore = await jwks.fetchKeyStore(keyStoreUrl)
      }

      let payload

      try {
        payload = JWT.verify(token, keyStore, joseOptions)
      } catch (e) {
        if (isNoMatchingKeyError(e) && isCachedKeyStore) {
          keyStore = await jwks.fetchKeyStore(keyStoreUrl)

          try {
            payload = JWT.verify(token, keyStore, joseOptions)
          } catch (eAfterRefetch) {
            handleVerificationError(e)
          }
        }

        handleVerificationError(e)
      }

      validateTokenUseClaim(payload, tokenType)

      return payload
    },
  }
}

module.exports = {
  verifierFactory,
}
