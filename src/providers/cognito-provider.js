'use strict'

const JwtClaimValidationError = require('../errors/jwt-claim-validation-error')
const { requireString } = require('../util/validators')

function cognitoProviderFactory({ region, userPoolId, appClientId }) {
  requireString(region, 'region')
  requireString(userPoolId, 'userPoolId')
  requireString(appClientId, 'appClientId')

  return {
    keyStoreUrl: `https://cognito-idp.${region}.amazonaws.com/${userPoolId}/.well-known/jwks.json`,
    joseOptions: {
      audience: appClientId,
      issuer: `https://cognito-idp.${region}.amazonaws.com/${userPoolId}`,
    },
    verifyClaims: (payload, { tokenType }) => {
      if (!payload.token_use || payload.token_use !== tokenType) {
        throw new JwtClaimValidationError(
          'token_use',
          `expected "${tokenType}", got "${payload.token_use}"`,
        )
      }
    },
  }
}

module.exports = {
  cognitoProviderFactory,
}
