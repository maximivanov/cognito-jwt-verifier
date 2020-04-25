'use strict'

const https = require('https')
const JwksFetchError = require('../errors/jwks-fetch-error')
const { JWKS } = require('jose')

async function fetchKeyStore(keyStoreUrl) {
  return new Promise((resolve, reject) => {
    const request = https.get(keyStoreUrl, (res) => {
      if (res.statusCode < 200 || res.statusCode > 299) {
        return reject(new JwksFetchError(`HTTP status code ${res.statusCode}`))
      }

      const body = []
      res.on('data', (chunk) => body.push(chunk))
      res.on('end', () => {
        const jsonString = Buffer.concat(body).toString()

        let keyStoreJson
        try {
          keyStoreJson = JSON.parse(jsonString)
        } catch (e) {
          return reject(new JwksFetchError(`Cannot parse fetched JWKS JSON`))
        }

        let keyStore
        try {
          keyStore = JWKS.asKeyStore(keyStoreJson)
        } catch (e) {
          return reject(e)
        }

        resolve(keyStore)
      })
    })

    request.on('error', (err) => reject(new JwksFetchError(err.message)))
  })
}

module.exports = {
  fetchKeyStore,
}
