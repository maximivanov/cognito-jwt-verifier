const sinon = require('sinon')
const expect = require('chai').expect
const {
  JWT,
  JWKS,
  errors: { JWTExpired, JWKSNoMatchingKey },
} = require('jose')
const jwks = require('../../src/util/jwks')
const { verifierFactory } = require('../../src/verifier')
const {
  cognitoProviderFactory,
} = require('../../src/providers/cognito-provider')
const JwtClaimValidationError = require('../../src/errors/jwt-claim-validation-error')
const cognitoJwks = require('../fixtures/cognito-jwks.json')
const expiredToken =
  'eyJraWQiOiI0UFFoK0JaVExkRVFkeUM2b0VheVJDckVjblFDSXhqbFZFbTFVd2RhZ2ZNPSIsImFsZyI6IlJTMjU2In0.eyJhdF9oYXNoIjoiQlNFSWQ1bkYyN3pNck45QkxYLVRfQSIsInN1YiI6IjI0ZTI2OTEwLWU3YjktNGFhZC1hOTk0LTM4Nzk0MmYxNjRlNyIsImF1ZCI6IjVyYTkxaTlwNHRycTQybTJ2bmpzMHB2MDZxIiwiZXZlbnRfaWQiOiJiNmQ3YTYyZC01NGRhLTQ5ZTYtYTgzOS02NjUwNmYwYzIxYjUiLCJ0b2tlbl91c2UiOiJpZCIsImF1dGhfdGltZSI6MTU4NzMxMTgzOCwiaXNzIjoiaHR0cHM6XC9cL2NvZ25pdG8taWRwLnVzLWVhc3QtMS5hbWF6b25hd3MuY29tXC91cy1lYXN0LTFfUERzeTZpMEJmIiwibmFtZSI6Ik1heCBJdmFub3YiLCJjb2duaXRvOnVzZXJuYW1lIjoiMjRlMjY5MTAtZTdiOS00YWFkLWE5OTQtMzg3OTQyZjE2NGU3IiwiZXhwIjoxNTg3MzE1NDM4LCJpYXQiOjE1ODczMTE4MzgsImVtYWlsIjoibWF4QHNvdXRobGFuZS5jb20ifQ.GrlpeYQDwB81HjBZRkuqzw0ZXSGFBi_pbMoWC1QvHyPYrc6NRto02H4xgMls5OmCGa4bZBYWTT6wfo0bxuOLZDP__JRSfOyPUIbiAWTu1IiyAhbt3nlW1xSNSvf62xXQNveF9sPcvG2Gh6-0nFEUrAuI1a5QAVjXbp1YDDMr2TzrFrugW7zl2Ntzj42xWIq7P0R75S2JYVmBfhAxS6YNO1n8KpOFzxagxmn89leledx4PTxuOdWdmT6vZkW9q9QnOI9kjgUIxfWjx55205P4BwkOeqY7AN0j85LBwAHbhezfzNETybX1pwnMBh1p5_iLYgQMMZ60ZJseGl3cMRsPnQ'

function getProvider() {
  const providerOptions = {
    region: 'us-east-1',
    userPoolId: 'us-east-1_PDsy6i0Bf',
    appClientId: '5ra91i9p4trq42m2vnjs0pv06q',
  }
  return cognitoProviderFactory(providerOptions)
}

const provider = getProvider()

describe('verifierFactory()', function () {
  it('fails on missing provider', function () {
    expect(() => {
      verifierFactory({})
    }).to.throw(/"provider" must be an instance of a provider/)
  })

  it('fails on invalid provider', function () {
    expect(() => {
      verifierFactory({ tokenType: 'id', provider: { wrong: 'provider' } })
    }).to.throw(/"provider" must be an instance of a provider/)
  })

  it('fails on missing token type', function () {
    expect(() => {
      verifierFactory({ provider })
    }).to.throw(/"tokenType" must be either "id" or "access"/)
  })

  it('fails on invalid token type', function () {
    expect(() => {
      verifierFactory({ provider, tokenType: 'ids' })
    }).to.throw(/"tokenType" must be either "id" or "access"/)
  })

  it('returns verifier instance with all properties', function () {
    const verifier = verifierFactory({ provider, tokenType: 'id' })

    expect(verifier.verify).to.be.an.instanceOf(Function)
  })
})

describe('verifier', async function () {
  describe('verify()', async function () {
    it('fails on missing token', async function () {
      const verifier = verifierFactory({ provider, tokenType: 'id' })

      try {
        await verifier.verify()
        expect.fail('Unexpected success')
      } catch (e) {
        expect(e.message).to.match(/"token" must be a non-empty string/)
      }
    })

    it('refetches key store if no matches found in cache', async function () {
      const verifier = verifierFactory({ provider, tokenType: 'id' })

      sinon.stub(JWT, 'verify').returns({})
      sinon.stub(jwks, 'fetchKeyStore').returns({})
      sinon.stub(provider, 'verifyClaims')

      // fill key store cache
      await verifier.verify('some-token')

      sinon.restore()

      const jwtVerifyStub = sinon
        .stub(JWT, 'verify')
        .throws(new JWKSNoMatchingKey())
      sinon.stub(jwks, 'fetchKeyStore').returns({})

      try {
        await verifier.verify('some-token')
        expect.fail('Unexpected success')
      } catch (e) {
        expect(e).to.be.an.instanceOf(JWKSNoMatchingKey)
      }

      expect(jwtVerifyStub.callCount).to.eq(2)
    })

    it('rejects on expired token', async function () {
      const verifier = verifierFactory({ provider, tokenType: 'id' })

      const keyStore = JWKS.asKeyStore(cognitoJwks)
      sinon.stub(jwks, 'fetchKeyStore').returns(keyStore)

      try {
        await verifier.verify(expiredToken)
        expect.fail('Unexpected success')
      } catch (e) {
        expect(e).to.be.an.instanceOf(JWTExpired)
      }
    })

    it('rejects on provider.verifyClaims fail', async function () {
      const verifier = verifierFactory({ provider, tokenType: 'id' })
      sinon.stub(jwks, 'fetchKeyStore').returns({})
      sinon.stub(JWT, 'verify').returns({})
      sinon.stub(provider, 'verifyClaims').throws(new JwtClaimValidationError())

      try {
        await verifier.verify('some-token')
        expect.fail('Unexpected success')
      } catch (e) {
        expect(e).to.be.an.instanceOf(JwtClaimValidationError)
      }
    })

    it('returns JWT payload', async function () {
      const verifier = verifierFactory({ provider, tokenType: 'id' })
      sinon.stub(jwks, 'fetchKeyStore').returns({})
      const expectedPayload = {}
      sinon.stub(JWT, 'verify').returns(expectedPayload)
      sinon.stub(provider, 'verifyClaims')

      try {
        const actualPayload = await verifier.verify('some-token')
        expect(actualPayload).to.eq(expectedPayload)
      } catch (e) {
        expect.fail('Unexpected fail')
      }
    })
  })
})
