'use strict'

const { verifierFactory } = require('./src/verifier')
const { cognitoProviderFactory } = require('./src/providers/cognito-provider')

module.exports = {
  verifierFactory,
  cognitoProviderFactory,
}
