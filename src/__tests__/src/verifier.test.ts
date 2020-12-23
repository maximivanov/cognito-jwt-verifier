import jwtVerify from 'jose/jwt/verify'
import { JWKSNoMatchingKey } from 'jose/util/errors'
import { JwtCognitoClaimValidationError } from '../../errors'
import { verifierFactory } from '../../verifier'

jest.mock('jose/jwt/verify', () => ({
  __esModule: true,
  default: jest.fn(),
}))

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
      // @ts-expect-error passig invalid value intentionally
      verifierFactory({})
    }).toThrow(/"region" must be a non-empty string/)
  })

  it('fails on empty region', function () {
    expect(() => {
      // @ts-expect-error passig invalid value intentionally
      verifierFactory({ region: '' })
    }).toThrow(/"region" must be a non-empty string/)
  })

  it('fails on missing userPoolId', function () {
    expect(() => {
      // @ts-expect-error passig invalid value intentionally
      verifierFactory({ region: 'us-east-1' })
    }).toThrow(/"userPoolId" must be a non-empty string/)
  })

  it('fails on missing appClientId', function () {
    expect(() => {
      // @ts-expect-error passig invalid value intentionally
      verifierFactory({
        region: 'us-east-1',
        userPoolId: 'us-east-1_PDsy6i0Bf',
      })
    }).toThrow(/"appClientId" must be a non-empty string/)
  })

  it('fails on missing token type', function () {
    expect(() => {
      // @ts-expect-error passig invalid value intentionally
      verifierFactory({
        region: 'us-east-1',
        userPoolId: 'us-east-1_PDsy6i0Bf',
        appClientId: '5ra91i9p4trq42m2vnjs0pv06q',
      })
    }).toThrow(/"tokenType" must be either "id" or "access"/)
  })

  it('fails on invalid token type', function () {
    expect(() => {
      verifierFactory({
        region: 'us-east-1',
        userPoolId: 'us-east-1_PDsy6i0Bf',
        appClientId: '5ra91i9p4trq42m2vnjs0pv06q',
        // @ts-expect-error passing wrong value intentionally
        tokenType: 'ids',
      })
    }).toThrow(/"tokenType" must be either "id" or "access"/)
  })

  it('returns verifier instance with all properties', function () {
    const verify = verifierFactory({
      region: 'us-east-1',
      userPoolId: 'us-east-1_PDsy6i0Bf',
      appClientId: '5ra91i9p4trq42m2vnjs0pv06q',
      tokenType: 'id',
    })

    expect(verify).toBeInstanceOf(Function)
  })
})

describe('verifier', function () {
  describe('verify()', function () {
    it('fails on missing token', async function () {
      const verify = getVerifier()

      try {
        // @ts-expect-error not passing arguments intentionally
        await verify()
        fail('Unexpected success')
      } catch (e) {
        expect(e.message).toMatch(/"token" must be a non-empty string/)
      }
    })

    it('rejects on key not found in key set (w/ empty cache)', async function () {
      const verify = getVerifier()

      ;(jwtVerify as jest.Mock).mockImplementation(() => {
        throw new JWKSNoMatchingKey()
      })

      try {
        await verify('some-token')
        fail('Unexpected success')
      } catch (e) {
        expect(e).toBeInstanceOf(JWKSNoMatchingKey)
      }

      expect((jwtVerify as jest.Mock).mock.calls.length).toEqual(1)
    })

    it('rejects on mismatched token_use', async function () {
      const verify = getVerifier()

      ;(jwtVerify as jest.Mock).mockImplementation(() => ({
        payload: {
          token_use: 'access',
        },
      }))

      try {
        await verify('some-token')
        fail('Unexpected success')
      } catch (e) {
        expect(e).toBeInstanceOf(JwtCognitoClaimValidationError)
      }

      expect((jwtVerify as jest.Mock).mock.calls.length).toEqual(1)
    })

    it('returns JWT payload', async function () {
      const verify = getVerifier()

      const expectedPayload = { token_use: 'id' }
      ;(jwtVerify as jest.Mock).mockImplementation(() => ({
        payload: expectedPayload,
      }))

      try {
        const actualPayload = await verify('some-token')
        expect(actualPayload).toEqual(expectedPayload)
      } catch (e) {
        fail('Unexpected fail')
      }

      expect((jwtVerify as jest.Mock).mock.calls.length).toEqual(1)
    })
  })
})
