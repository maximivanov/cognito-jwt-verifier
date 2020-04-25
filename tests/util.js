'use strict'

function randomWord() {
  return Math.random().toString(36).slice(2)
}

module.exports = {
  randomWord,
}
