import { randomWord } from '../util'
import { JwtCognitoClaimValidationError } from '../../errors'

describe('JwtCognitoClaimValidationError', function () {
  describe('constructor', function () {
    it('builds an instance with all properties', function () {
      const claim = randomWord()
      const message = randomWord()
      const e = new JwtCognitoClaimValidationError(claim, message)

      expect(e.name).toEqual('JwtCognitoClaimValidationError')
      expect(e.message).toMatch(new RegExp(`${claim}.*${message}`))
    })
  })
})
