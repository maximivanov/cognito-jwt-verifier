'use strict'

const expect = require('chai').expect
const { randomWord } = require('../../util')
const JwtCognitoClaimValidationError = require('../../../src/errors/jwt-cognito-claim-validation-error')

describe('JwtCognitoClaimValidationError', function () {
  describe('constructor', function () {
    it('builds an instance with all properties', function () {
      const claim = randomWord()
      const message = randomWord()
      const e = new JwtCognitoClaimValidationError(claim, message)

      expect(e.name).to.eq('JwtCognitoClaimValidationError')
      expect(e.message).to.match(new RegExp(`${claim}.*${message}`))
    })
  })
})
