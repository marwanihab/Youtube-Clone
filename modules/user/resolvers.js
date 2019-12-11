import { AuthenticationError, ApolloError, UserInputError } from 'apollo-server'
import { prop, propOr } from 'ramda'
import { sign } from 'jsonwebtoken'
import { compare } from 'bcryptjs'
import { authenticate, hashPassword } from '../../auth'
import {
  SERVER_ERROR,
  UNAUTHORIZED,
  INVALID_CREDENTIALS,
  PASSWORD_RULES,
  USERNAME_ALREADY_EXISTS,
  USER_NOT_FOUND,
  USER_ALREADY_DELETED,
  PASSWORD_CHANGED,
} from '../../messages'


const resolver = {
  Query: {
  },
  Mutation: {
    addUser: async (parent, args, ctx) => {
      try {
        const password = prop('password')(args)
        const hashedPassword = await hashPassword(password, prop('username')(args))
        if (!hashedPassword) return new UserInputError(PASSWORD_RULES)

        const user = new ctx.User({
          username: prop('username')(args),
          password: hashedPassword,
        })
        await user.save()

        const payload = { username: user.username }
        const token = await sign(payload, propOr('secret for test', 'JWT_SECRET')(process.env))

        return {token : token, username: user.username}  
      } catch (e) {
        if (e.errmsg && e.errmsg.split(':')[0] === 'E11000 duplicate key error index') {
          return new UserInputError(USERNAME_ALREADY_EXISTS)
        }
        console.log(e)
        return new ApolloError(SERVER_ERROR, '500')
      }
    },
    login: async (parent, args, ctx) => {
      try {
        const user = await ctx.User.findOne({ username: prop('username')(args),
          isDeleted: false })
        if (!user){
          try {
            const password = prop('password')(args)
            const hashedPassword = await hashPassword(password, prop('username')(args))
            if (!hashedPassword) return new UserInputError(PASSWORD_RULES)
    
            const user = new ctx.User({
              username: prop('username')(args),
              password: hashedPassword,
            })
            await user.save()
    
            const payload = { username: user.username }
            const token = await sign(payload, propOr('secret for test', 'JWT_SECRET')(process.env))
    
            return {token : token, username: user.username}  
          } catch (e) {
            if (e.errmsg && e.errmsg.split(':')[0] === 'E11000 duplicate key error index') {
              return new UserInputError(USERNAME_ALREADY_EXISTS)
            }
            console.log(e)
            return new ApolloError(SERVER_ERROR, '500')
          }
        }
        const paswordMatched = await compare(prop('password')(args), user.password)
    
        if (!paswordMatched) return new AuthenticationError(INVALID_CREDENTIALS)

        const payload = {
          username: user.username,
        }
        const token = await sign(payload, propOr('secret for test', 'JWT_SECRET')(process.env))

        return {token : token, username: user.username}  
      } catch (e) {
        console.log(e)
        return new ApolloError(SERVER_ERROR, '500')
      }
    },
    editUser: async (parent, args, ctx) => {
      try {
        const payload = await authenticate(ctx.token)
        if (!payload) return new AuthenticationError(UNAUTHORIZED)

        const user = await ctx.User.findOne({ username: prop('username')(args), isDeleted: false })
        if (!user) return new UserInputError(USER_NOT_FOUND)

        const passwordMatched = await compare(prop('password')(args), user.password)
        if (!passwordMatched) return new AuthenticationError(INVALID_CREDENTIALS)

        if (prop('newPassword')(args)) {
          const password = prop('newPassword')(args)
          const hashedPassword = await hashPassword(password, prop('username')(payload))
          if (!hashedPassword) return new UserInputError(PASSWORD_RULES)
          user.password = hashedPassword
        }
        await user.save()

        const userPayload = {
          username: user.username,
        }
        await sign(userPayload, propOr('secret for test', 'JWT_SECRET')(process.env))

        return PASSWORD_CHANGED
      } catch (e) {
        console.log(e)
        return new ApolloError(SERVER_ERROR, '500')
      }
    },
    deleteUser: async (parent, args, ctx) => {
      try {
        const payload = await authenticate(ctx.token)
        if (!payload) return new AuthenticationError(UNAUTHORIZED)

        const user = await ctx.User.findOne({ username: prop('username')(args) })
        if (!user) return new UserInputError(USER_NOT_FOUND)
        if (user.isDeleted) return new UserInputError(USER_ALREADY_DELETED)

        user.isDeleted = true
        await user.save()

        return user._id
      } catch (e) {
        console.log(e)
        return new ApolloError(SERVER_ERROR, '500')
      }
    },
  },
}

export default resolver
