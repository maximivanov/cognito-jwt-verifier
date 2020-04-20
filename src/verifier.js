'use strict'

const {
  JWT,
  errors: { JOSEError },
} = require('jose')
const jwks = require('./util/jwks')
const { requireString } = require('./util/validators')
const JwtClaimValidationError = require('./errors/jwt-claim-validation-error')

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
    audience: appClientId,
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
        if (
          e instanceof JOSEError &&
          e.code === 'ERR_JWKS_NO_MATCHING_KEY' &&
          isCachedKeyStore
        ) {
          keyStore = await jwks.fetchKeyStore(keyStoreUrl)

          payload = JWT.verify(token, keyStore, joseOptions)
        }

        throw e
      }

      if (!payload.token_use || payload.token_use !== tokenType) {
        throw new JwtClaimValidationError(
          'token_use',
          `expected "${tokenType}", got "${payload.token_use}"`,
        )
      }

      return payload
    },
  }
}

module.exports = {
  verifierFactory,
}
