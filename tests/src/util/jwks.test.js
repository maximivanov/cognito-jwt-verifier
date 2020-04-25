'use strict'

const https = require('https')
const sinon = require('sinon')
const expect = require('chai').expect
const MockReq = require('mock-req')
const MockRes = require('mock-res')
const { fetchKeyStore } = require('../../../src/util/jwks')
const JwksFetchError = require('../../../src/errors/jwks-fetch-error')
const cognitoJwks = require('../../fixtures/cognito-jwks.json')
const {
  JWKS: { KeyStore },
} = require('jose')

describe('util/jwks', async function () {
  describe('fetchKeyStore()', async function () {
    ;[
      { description: 'rejects on status code <200', code: 199 },
      { description: 'rejects on status code >299', code: 301 },
    ].forEach((test) => {
      it(test.description, async function () {
        sinon.stub(https, 'get').yields({
          statusCode: test.code,
        })

        try {
          await fetchKeyStore('https://...')
          expect.fail('Unexpected success')
        } catch (e) {
          expect(e).to.be.an.instanceOf(JwksFetchError)
          expect(e.message).to.match(
            new RegExp(
              `Failed to fetch key set JSON: HTTP status code ${test.code}`,
            ),
          )
        }
      })
    })

    it('rejects on HTTP req module-triggered error', async function () {
      const req = new MockReq()

      sinon.stub(https, 'get').returns(req)

      const promise = fetchKeyStore('https://...')
        .then(() => {
          expect.fail('Unexpected success')
        })
        .catch((e) => {
          expect(e).to.be.an.instanceOf(JwksFetchError)
          expect(e.message).to.match(
            new RegExp(`Failed to fetch key set JSON: custom`),
          )
        })

      req.emit('error', new Error('custom'))
      await promise
    })

    it('rejects when fetched malfored JSON', async function () {
      const req = new MockReq()
      const res = new MockRes()

      sinon.stub(https, 'get').yields(res).returns(req)

      const promise = fetchKeyStore('https://...')
        .then(() => {
          expect.fail('Unexpected success')
        })
        .catch((e) => {
          expect(e).to.be.an.instanceOf(JwksFetchError)
          expect(e.message).to.match(
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

      sinon.stub(https, 'get').yields(res).returns(req)

      const promise = fetchKeyStore('https://...')
        .then(() => {
          expect.fail('Unexpected success')
        })
        .catch((e) => {
          expect(e).to.be.an.instanceOf(TypeError)
          expect(e.message).to.match(
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

      sinon.stub(https, 'get').yields(res).returns(req)

      const promise = fetchKeyStore('https://...').then((jwksStore) => {
        expect(jwksStore).to.be.an.instanceOf(KeyStore)
      })

      res.write(JSON.stringify(cognitoJwks))
      res.end()

      await promise
    })
  })
})
