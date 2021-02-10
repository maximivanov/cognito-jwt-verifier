import createRemoteJWKSet from 'jose/jwks/remote'
import jwtVerify, { JWTPayload } from 'jose/jwt/verify'

import { requireString } from './util/validators'
import { JwtCognitoClaimValidationError } from './errors'

function validateTokenUseClaim(payload: JWTPayload, tokenType: string) {
  if (!payload.token_use || payload.token_use !== tokenType) {
    throw new JwtCognitoClaimValidationError(
      'token_use',
      `expected "${tokenType}", got "${payload.token_use}"`,
    )
  }
}

type TokenType = 'id' | 'access'

type VerifierFactoryOptions = {
  region: string
  userPoolId: string
  appClientId: string
  tokenType: TokenType
}

type VerifyFunction = (token: string) => JWTPayload

export function verifierFactory({
  region,
  userPoolId,
  appClientId,
  tokenType,
}: VerifierFactoryOptions): VerifyFunction {
  requireString(region, 'region')
  requireString(userPoolId, 'userPoolId')
  requireString(appClientId, 'appClientId')
  if (!['id', 'access'].includes(tokenType)) {
    throw new TypeError(`"tokenType" must be either "id" or "access"`)
  }

  const keyStoreUrl = `https://cognito-idp.${region}.amazonaws.com/${userPoolId}/.well-known/jwks.json`
  const joseOptions = {
    profile: tokenType === 'id' ? 'id_token' : undefined,
    audience: tokenType === 'id' ? appClientId : undefined,
    issuer: `https://cognito-idp.${region}.amazonaws.com/${userPoolId}`,
  }

  const JWKS = createRemoteJWKSet(new URL(keyStoreUrl))

  return async (token: string) => {
    requireString(token, 'token')

    const { payload } = await jwtVerify(token, JWKS, joseOptions)
    validateTokenUseClaim(payload, tokenType)

    return payload
  }
}
