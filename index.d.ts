type TokenType = 'id' | 'access'

interface AccessTokenPayload {
  sub: string
  iss: string
  client_id: string
  origin_jti: string
  event_id: string
  token_use: 'access'
  scope: string
  auth_time: number
  exp: number
  iat: number
  jti: string
  username: string
  [key: string]: any
}

interface IdTokenPayload {
  sub: string
  email_verified: boolean
  iss: string
  preferred_username: string
  origin_jti: string
  aud: string
  event_id: string
  token_use: 'id'
  auth_time: number
  name: string
  exp: number
  iat: number
  jti: string
  email: string
  [key: `custom:${string}`]: string
}

export function verifierFactory<T extends TokenType>(options: {
  appClientId: string
  region: string
  tokenType: T
  userPoolId: string
}): {
  verify(
    token: string,
  ): Promise<T extends 'access' ? AccessTokenPayload : IdTokenPayload>
}

export const errors = {
  JwksFetchError: class JwksFetchError extends Error {},
  JwksNoMatchingKeyError: class JwksNoMatchingKeyError extends Error {},
  JwtCognitoClaimValidationError: class JwtCognitoClaimValidationError extends Error {},
  JwtVerificationError: class JwtVerificationError extends Error {},
}
