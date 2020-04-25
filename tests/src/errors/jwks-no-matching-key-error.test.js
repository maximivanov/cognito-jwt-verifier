'use strict'

const expect = require('chai').expect
const { randomWord } = require('../../util')
const JwksNoMatchingKeyError = require('../../../src/errors/jwks-no-matching-key-error')

describe('JwksNoMatchingKeyError', function () {
  describe('constructor', function () {
    it('builds an instance with all properties', function () {
      const message = randomWord()
      const originalError = new Error(message)
      const e = new JwksNoMatchingKeyError(originalError)

      expect(e.name).to.eq('JwksNoMatchingKeyError')
      expect(e.originalError).to.eq(originalError)
    })
  })
})
