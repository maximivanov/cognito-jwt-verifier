const expect = require('chai').expect
const { randomWord } = require('../../util')
const JwtClaimValidationError = require('../../../src/errors/jwt-claim-validation-error')

describe('JwtClaimValidationError', function () {
  describe('constructor', function () {
    it('builds an instance with all properties', function () {
      const claim = randomWord()
      const message = randomWord()
      const e = new JwtClaimValidationError(claim, message)

      expect(e.name).to.eq('JwtClaimValidationError')
      expect(e.message).to.match(new RegExp(`${claim}.*${message}`))
    })
  })
})
