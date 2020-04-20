'use strict'

const {
  JWT,
  errors: { JOSEError },
} = require('jose')
const jwks = require('./util/jwks')
const { requireString } = require('./util/validators')

function isProvider(provider) {
  return !!provider && !!provider.keyStoreUrl && !!provider.joseOptions
}

function getJoseOptions({ provider, tokenType }) {
  const defaultOptions = {
    profile: tokenType === 'id' ? 'id_token' : undefined,
  }

  const providerOptions = provider.joseOptions

  return Object.assign({}, defaultOptions, providerOptions)
}

function verifierFactory({ provider, tokenType }) {
  if (!isProvider(provider)) {
    throw new TypeError('"provider" must be an instance of a provider')
  }

  if (!['id', 'access'].includes(tokenType)) {
    throw new TypeError('"tokenType" must be either "id" or "access"')
  }

  let keyStore
  let verificationOptions = getJoseOptions({ provider, tokenType })

  return {
    verify: async (token) => {
      requireString(token, 'token')

      const isCachedKeyStore = keyStore !== undefined
      if (!isCachedKeyStore) {
        keyStore = await jwks.fetchKeyStore(provider.keyStoreUrl)
      }

      let payload

      try {
        payload = JWT.verify(token, keyStore, verificationOptions)
      } catch (e) {
        if (
          e instanceof JOSEError &&
          e.code === 'ERR_JWKS_NO_MATCHING_KEY' &&
          isCachedKeyStore
        ) {
          keyStore = await jwks.fetchKeyStore(provider.keyStoreUrl)

          payload = JWT.verify(token, keyStore, verificationOptions)
        }

        throw e
      }

      if (provider.verifyClaims) {
        provider.verifyClaims(payload, { tokenType })
      }

      return payload
    },
  }
}

module.exports = {
  verifierFactory,
}
