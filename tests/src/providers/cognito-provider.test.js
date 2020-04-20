const expect = require('chai').expect
const { randomWord } = require('../../util')
const tokenPayload = require('../../fixtures/cognito-expired-id-token-payload.json')
const JwtClaimValidationError = require('../../../src/errors/jwt-claim-validation-error')

const {
  cognitoProviderFactory,
} = require('../../../src/providers/cognito-provider')
const factoryOptions = {
  region: 'us-east-1',
  userPoolId: randomWord(),
  appClientId: randomWord(),
}

describe('cognitoProviderFactory()', function () {
  it('fails on missing region', function () {
    expect(() => {
      cognitoProviderFactory({})
    }).to.throw(/"region" must be a non-empty string/)
  })

  it('fails on empty region', function () {
    expect(() => {
      cognitoProviderFactory({ region: '' })
    }).to.throw(/"region" must be a non-empty string/)
  })

  it('fails on missing userPoolId', function () {
    expect(() => {
      cognitoProviderFactory({ region: 'us-east-1' })
    }).to.throw(/"userPoolId" must be a non-empty string/)
  })

  it('fails on missing appClientId', function () {
    expect(() => {
      cognitoProviderFactory({ region: 'us-east-1', userPoolId: randomWord() })
    }).to.throw(/"appClientId" must be a non-empty string/)
  })

  it('returns provider instance with all properties', function () {
    const provider = cognitoProviderFactory(factoryOptions)

    expect(provider.keyStoreUrl).to.eq(
      `https://cognito-idp.${factoryOptions.region}.amazonaws.com/${factoryOptions.userPoolId}/.well-known/jwks.json`,
    )
    expect(provider.joseOptions).to.deep.equal({
      audience: factoryOptions.appClientId,
      issuer: `https://cognito-idp.${factoryOptions.region}.amazonaws.com/${factoryOptions.userPoolId}`,
    })
    expect(provider.verifyClaims).to.be.an.instanceOf(Function)
  })
})

describe('cognitoProvider', function () {
  describe('verifyClaims()', function () {
    it('fails on mismatched token_use', () => {
      const provider = cognitoProviderFactory(factoryOptions)

      expect(() => {
        provider.verifyClaims(tokenPayload, { tokenType: 'access' })
      }).to.throw(JwtClaimValidationError)
    })

    it('passes on matching token_use', () => {
      const provider = cognitoProviderFactory(factoryOptions)

      expect(provider.verifyClaims(tokenPayload, { tokenType: 'id' })).to.eq(
        undefined,
      )
    })
  })
})
