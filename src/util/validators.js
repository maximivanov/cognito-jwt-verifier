'use strict'

function requireString(value, name) {
  if (typeof value !== 'string' || !value) {
    throw new TypeError(`"${name}" must be a non-empty string`)
  }
}

module.exports = { requireString }
