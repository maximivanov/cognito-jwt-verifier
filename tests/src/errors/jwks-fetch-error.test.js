'use strict'

const expect = require('chai').expect
const { randomWord } = require('../../util')
const JwksFetchError = require('../../../src/errors/jwks-fetch-error')

describe('JwksFetchError', function () {
  describe('constructor', function () {
    it('builds an instance with all properties', function () {
      const message = randomWord()
      const e = new JwksFetchError(message)

      expect(e.name).to.eq('JwksFetchError')
      expect(e.message).to.match(new RegExp(message))
    })
  })
})
