'use strict'

const expect = require('chai').expect
const { randomWord } = require('../../util')
const JwtVerificationError = require('../../../src/errors/jwt-verification-error')

describe('JwtVerificationError', function () {
  describe('constructor', function () {
    it('builds an instance with all properties', function () {
      const message = randomWord()
      const originalError = new Error(message)
      const e = new JwtVerificationError(originalError)

      expect(e.name).to.eq('JwtVerificationError')
      expect(e.originalError).to.eq(originalError)
      expect(e.message).to.match(new RegExp(`${message}`))
    })
  })
})
