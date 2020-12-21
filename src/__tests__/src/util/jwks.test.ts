import https from 'https'
import MockReq from 'mock-req'
import MockRes from 'mock-res'
import { fetchKeyStore } from '../../../util/jwks'
import { JwksFetchError } from '../../../errors'
import cognitoJwks from '../../fixtures/cognito-jwks.json'
import { JWKS } from 'jose'

describe('util/jwks', function () {
  describe('fetchKeyStore()', function () {
    ;[
      { description: 'rejects on status code <200', code: 199 },
      { description: 'rejects on status code >299', code: 301 },
    ].forEach((test) => {
      it(test.description, async function () {
        https.get = jest.fn().mockImplementation((keyStoreUrl, cb) => {
          cb({ statusCode: test.code })
        })

        try {
          await fetchKeyStore('https://...')
          fail('Unexpected success')
        } catch (e) {
          expect(e).toBeInstanceOf(JwksFetchError)
          expect(e.message).toMatch(
            new RegExp(
              `Failed to fetch key set JSON: HTTP status code ${test.code}`,
            ),
          )
        }
      })
    })

    it('rejects on HTTP req module-triggered error', async function () {
      const req = new MockReq()

      // sinon.stub(https, 'get').returns(req)
      https.get = jest.fn().mockImplementation(() => req)

      const promise = fetchKeyStore('https://...')
        .then(() => {
          fail('Unexpected success')
        })
        .catch((e) => {
          expect(e).toBeInstanceOf(JwksFetchError)
          expect(e.message).toMatch(
            new RegExp(`Failed to fetch key set JSON: custom`),
          )
        })

      req.emit('error', new Error('custom'))
      await promise
    })

    it('rejects when fetched malfored JSON', async function () {
      const req = new MockReq()
      const res = new MockRes()

      https.get = jest.fn().mockImplementation((keyStoreUrl, cb) => {
        cb(res)
        return req
      })

      const promise = fetchKeyStore('https://...')
        .then(() => {
          fail('Unexpected success')
        })
        .catch((e) => {
          expect(e).toBeInstanceOf(JwksFetchError)
          expect(e.message).toMatch(
            new RegExp(`Cannot parse fetched JWKS JSON`),
          )
        })

      res.write('abc')
      res.end()

      await promise
    })

    it('rejects on non-JWKS JSON', async function () {
      const req = new MockReq()
      const res = new MockRes()

      https.get = jest.fn().mockImplementation((keyStoreUrl, cb) => {
        cb(res)
        return req
      })

      const promise = fetchKeyStore('https://...')
        .then(() => {
          fail('Unexpected success')
        })
        .catch((e) => {
          expect(e).toBeInstanceOf(TypeError)
          expect(e.message).toMatch(
            new RegExp(`jwks must be a JSON Web Key Set formatted object`),
          )
        })

      res.write(JSON.stringify({ invalid: 'json format' }))
      res.end()

      await promise
    })

    it('returns a key set object', async function () {
      const req = new MockReq()
      const res = new MockRes()

      https.get = jest.fn().mockImplementation((keyStoreUrl, cb) => {
        cb(res)
        return req
      })

      const promise = fetchKeyStore('https://...').then((jwksStore) => {
        expect(jwksStore).toBeInstanceOf(JWKS.KeyStore)
      })

      res.write(JSON.stringify(cognitoJwks))
      res.end()

      await promise
    })
  })
})
