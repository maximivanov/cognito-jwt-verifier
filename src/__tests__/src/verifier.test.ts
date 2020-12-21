import { JWT, JWKS, errors, JSONWebKeySet } from 'jose'
import * as jwks from '../../util/jwks'
import { verifierFactory } from '../../verifier'
import { JwtVerificationError, JwksNoMatchingKeyError } from '../../errors'

import cognitoJwks from '../fixtures/cognito-jwks.json'
const expiredToken =
  'eyJraWQiOiI0UFFoK0JaVExkRVFkeUM2b0VheVJDckVjblFDSXhqbFZFbTFVd2RhZ2ZNPSIsImFsZyI6IlJTMjU2In0.eyJhdF9oYXNoIjoiQlNFSWQ1bkYyN3pNck45QkxYLVRfQSIsInN1YiI6IjI0ZTI2OTEwLWU3YjktNGFhZC1hOTk0LTM4Nzk0MmYxNjRlNyIsImF1ZCI6IjVyYTkxaTlwNHRycTQybTJ2bmpzMHB2MDZxIiwiZXZlbnRfaWQiOiJiNmQ3YTYyZC01NGRhLTQ5ZTYtYTgzOS02NjUwNmYwYzIxYjUiLCJ0b2tlbl91c2UiOiJpZCIsImF1dGhfdGltZSI6MTU4NzMxMTgzOCwiaXNzIjoiaHR0cHM6XC9cL2NvZ25pdG8taWRwLnVzLWVhc3QtMS5hbWF6b25hd3MuY29tXC91cy1lYXN0LTFfUERzeTZpMEJmIiwibmFtZSI6Ik1heCBJdmFub3YiLCJjb2duaXRvOnVzZXJuYW1lIjoiMjRlMjY5MTAtZTdiOS00YWFkLWE5OTQtMzg3OTQyZjE2NGU3IiwiZXhwIjoxNTg3MzE1NDM4LCJpYXQiOjE1ODczMTE4MzgsImVtYWlsIjoibWF4QHNvdXRobGFuZS5jb20ifQ.GrlpeYQDwB81HjBZRkuqzw0ZXSGFBi_pbMoWC1QvHyPYrc6NRto02H4xgMls5OmCGa4bZBYWTT6wfo0bxuOLZDP__JRSfOyPUIbiAWTu1IiyAhbt3nlW1xSNSvf62xXQNveF9sPcvG2Gh6-0nFEUrAuI1a5QAVjXbp1YDDMr2TzrFrugW7zl2Ntzj42xWIq7P0R75S2JYVmBfhAxS6YNO1n8KpOFzxagxmn89leledx4PTxuOdWdmT6vZkW9q9QnOI9kjgUIxfWjx55205P4BwkOeqY7AN0j85LBwAHbhezfzNETybX1pwnMBh1p5_iLYgQMMZ60ZJseGl3cMRsPnQ'

function getVerifier() {
  return verifierFactory({
    region: 'us-east-1',
    userPoolId: 'us-east-1_PDsy6i0Bf',
    appClientId: '5ra91i9p4trq42m2vnjs0pv06q',
    tokenType: 'id',
  })
}

describe('verifierFactory()', function () {
  it('fails on missing region', function () {
    expect(() => {
      verifierFactory({} as any)
    }).toThrow(/"region" must be a non-empty string/)
  })

  it('fails on empty region', function () {
    expect(() => {
      verifierFactory({ region: '' } as any)
    }).toThrow(/"region" must be a non-empty string/)
  })

  it('fails on missing userPoolId', function () {
    expect(() => {
      verifierFactory({ region: 'us-east-1' } as any)
    }).toThrow(/"userPoolId" must be a non-empty string/)
  })

  it('fails on missing appClientId', function () {
    expect(() => {
      verifierFactory({
        region: 'us-east-1',
        userPoolId: 'us-east-1_PDsy6i0Bf',
      } as any)
    }).toThrow(/"appClientId" must be a non-empty string/)
  })

  it('fails on missing token type', function () {
    expect(() => {
      verifierFactory({
        region: 'us-east-1',
        userPoolId: 'us-east-1_PDsy6i0Bf',
        appClientId: '5ra91i9p4trq42m2vnjs0pv06q',
      } as any)
    }).toThrow(/"tokenType" must be either "id" or "access"/)
  })

  it('fails on invalid token type', function () {
    expect(() => {
      verifierFactory({
        region: 'us-east-1',
        userPoolId: 'us-east-1_PDsy6i0Bf',
        appClientId: '5ra91i9p4trq42m2vnjs0pv06q',
        tokenType: 'ids',
      })
    }).toThrow(/"tokenType" must be either "id" or "access"/)
  })

  it('returns verifier instance with all properties', function () {
    const verifier = verifierFactory({
      region: 'us-east-1',
      userPoolId: 'us-east-1_PDsy6i0Bf',
      appClientId: '5ra91i9p4trq42m2vnjs0pv06q',
      tokenType: 'id',
    })

    expect(verifier.verify).toBeInstanceOf(Function)
  })
})

describe('verifier', function () {
  describe('verify()', function () {
    it('fails on missing token', async function () {
      const verifier = getVerifier()

      try {
        // @ts-expect-error
        await verifier.verify()
        fail('Unexpected success')
      } catch (e) {
        expect(e.message).toMatch(/"token" must be a non-empty string/)
      }
    })

    it('rejects on key not found in key set (w/ empty cache)', async function () {
      const verifier = getVerifier()

      // @ts-expect-error
      jest.spyOn(jwks, 'fetchKeyStore').mockImplementation(() => ({}))
      jest.spyOn(JWT, 'verify').mockImplementation(() => {
        throw new errors.JWKSNoMatchingKey()
      })

      try {
        await verifier.verify('some-token')
        fail('Unexpected success')
      } catch (e) {
        expect(e).toBeInstanceOf(JwksNoMatchingKeyError)
      }

      expect((jwks.fetchKeyStore as jest.Mock).mock.calls.length).toEqual(1)
      expect((JWT.verify as jest.Mock).mock.calls.length).toEqual(1)
    })

    it('uses cache on subsequent calls', async function () {
      const verifier = getVerifier()

      // @ts-expect-error
      jest.spyOn(jwks, 'fetchKeyStore').mockImplementation(() => ({}))
      // @ts-expect-error
      jest.spyOn(JWT, 'verify').mockImplementation(() => ({ token_use: 'id' }))

      // fill key set cache with 1st call
      await verifier.verify('some-token')

      jest.clearAllMocks()

      // @ts-expect-error
      jest.spyOn(jwks, 'fetchKeyStore').mockImplementation(() => ({}))
      // @ts-expect-error
      jest.spyOn(JWT, 'verify').mockImplementation(() => ({ token_use: 'id' }))

      try {
        await verifier.verify('some-token')
      } catch (e) {
        fail('Unexpected failure')
      }

      expect((jwks.fetchKeyStore as jest.Mock).mock.calls.length).toEqual(0)
    })

    it('refetches key set if no matches found in cache', async function () {
      const verifier = getVerifier()

      // @ts-expect-error
      jest.spyOn(jwks, 'fetchKeyStore').mockImplementation(() => ({}))
      // @ts-expect-error
      jest.spyOn(JWT, 'verify').mockImplementation(() => ({ token_use: 'id' }))

      // fill key set cache with 1st call
      await verifier.verify('some-token')

      jest.clearAllMocks()

      jest.spyOn(JWT, 'verify').mockImplementation(() => {
        throw new errors.JWKSNoMatchingKey()
      })
      // @ts-expect-error
      jest.spyOn(jwks, 'fetchKeyStore').mockImplementation(() => ({}))

      try {
        await verifier.verify('some-token')
        fail('Unexpected success')
      } catch (e) {
        expect(e).toBeInstanceOf(JwksNoMatchingKeyError)
      }

      expect((jwks.fetchKeyStore as jest.Mock).mock.calls.length).toEqual(1)
      expect((JWT.verify as jest.Mock).mock.calls.length).toEqual(2)
    })

    it('rejects on expired token', async function () {
      const verifier = getVerifier()
      jest.restoreAllMocks()

      const keyStore = JWKS.asKeyStore(cognitoJwks as JSONWebKeySet)
      // @ts-expect-error
      jest.spyOn(jwks, 'fetchKeyStore').mockImplementation(() => keyStore)

      try {
        await verifier.verify(expiredToken)
        fail('Unexpected success')
      } catch (e) {
        expect(e).toBeInstanceOf(JwtVerificationError)
      }
    })

    it('rejects on mismatched token_use', async function () {
      const verifier = getVerifier()

      // @ts-expect-error
      jest.spyOn(jwks, 'fetchKeyStore').mockImplementation(() => ({}))

      jest
        .spyOn(JWT, 'verify')
        // @ts-expect-error
        .mockImplementation(() => ({ token_use: 'access' }))

      try {
        await verifier.verify('some-token')
        fail('Unexpected success')
      } catch (e) {
        expect(e).toBeInstanceOf(JwtVerificationError)
      }
    })

    it('returns JWT payload', async function () {
      const verifier = getVerifier()

      // @ts-expect-error
      jest.spyOn(jwks, 'fetchKeyStore').mockImplementation(() => ({}))

      const expectedPayload = { token_use: 'id' }
      // @ts-expect-error
      jest.spyOn(JWT, 'verify').mockImplementation(() => expectedPayload)

      try {
        const actualPayload = await verifier.verify('some-token')
        expect(actualPayload).toEqual(expectedPayload)
      } catch (e) {
        fail('Unexpected fail')
      }
    })
  })
})
