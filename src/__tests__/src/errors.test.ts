import { randomWord } from '../util'
import { JwksFetchError } from '../../errors'
import { JwksNoMatchingKeyError } from '../../errors'
import { JwtCognitoClaimValidationError } from '../../errors'
import { JwtVerificationError } from '../../errors'

describe('JwksFetchError', function () {
  describe('constructor', function () {
    it('builds an instance with all properties', function () {
      const message = randomWord()
      const e = new JwksFetchError(message)

      expect(e.name).toEqual('JwksFetchError')
      expect(e.message).toMatch(new RegExp(message))
    })
  })
})

describe('JwksNoMatchingKeyError', function () {
  describe('constructor', function () {
    it('builds an instance with all properties', function () {
      const message = randomWord()
      const originalError = new Error(message)
      const e = new JwksNoMatchingKeyError(originalError)

      expect(e.name).toEqual('JwksNoMatchingKeyError')
      expect(e.originalError).toEqual(originalError)
    })
  })
})

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

describe('JwtVerificationError', function () {
  describe('constructor', function () {
    it('builds an instance with all properties', function () {
      const message = randomWord()
      const originalError = new Error(message)
      const e = new JwtVerificationError(originalError)

      expect(e.name).toEqual('JwtVerificationError')
      expect(e.originalError).toEqual(originalError)
      expect(e.message).toMatch(new RegExp(`${message}`))
    })
  })
})
