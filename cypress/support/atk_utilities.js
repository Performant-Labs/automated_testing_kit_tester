/// <reference types='Cypress' />

/**
 * Return a string of random characters of specified length.
 * @param {length}        int   Length of string to return.
 */
function createRandomString (length) {
  let result = ''
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
  const charactersLength = characters.length

  for (let i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength))
  }
  return result
}

export { createRandomString }
