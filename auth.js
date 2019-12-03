import { verify } from 'jsonwebtoken'
import { propOr } from 'ramda'
import { genSalt, hash } from 'bcryptjs'


// just checks if the token is valid
export const authenticate = async (token) => {
  if (!token) return null
  try {
    const payload = (await verify(token, propOr('secret for test', 'JWT_SECRET')(process.env)))
    return payload
  } catch (e) {
    return null
  }
}

export const testPassword = async (password, username) => {
  if (!/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[^ ]{8,}$/.test(password) || password.includes(username)) {
    return false
  }
  return true
}

export const hashPassword = async (password, username) => {
  try {
    if (!await testPassword(password, username)) return false
    const salt = await genSalt()
    const hashedPassword = await hash(password, salt)
    return hashedPassword
  } catch (err) {
    return false
  }
}
