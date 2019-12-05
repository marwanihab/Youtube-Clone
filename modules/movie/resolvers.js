import { AuthenticationError, ApolloError, UserInputError } from 'apollo-server'
import { prop, propOr, isEmpty, path } from 'ramda'
import {  authenticate } from '../../auth'
import {
  MOVIE_NOT_FOUND,
  MOVIE_ALREADY_DELETED,
  UNAUTHORIZED,
  SERVER_ERROR,
  MOVIE_ID_ALREADY_EXISTS,
} from '../../messages'



const resolvers = {
  Query: {
    getMovies: async (parent, args, ctx) => {
      try {
        const payload = await authenticate(ctx.token)
        if (!payload) return new AuthenticationError(UNAUTHORIZED)

        const limit = Number(propOr(0, 'page')(args)) ? Number(propOr(0, 'pageSize')(args)) : 0
        const skip = (limit * Number(propOr(0, 'page')(args))) - limit

        const orFilter = []
        if (prop('movieID')(args)) orFilter.push({ movieID: prop('movieID')(args) })
        if (prop('name')(args)) orFilter.push({ name: prop('name')(args) })
        if (prop('description')(args)) orFilter.push({ description: prop('description')(args) })


        const match = isEmpty(orFilter)
          ? { isDeleted: propOr(false, 'isDeleted')(args) }
          : { $or: orFilter, isDeleted: propOr(false, 'isDeleted')(args) }

        const movies = await ctx.Movie.find(match).skip(skip).limit(limit)
        const count = await ctx.Movie.count(match)
        

        return { totalCount: count, items: movies }
      } catch (e) {
        console.log(e)
        return new ApolloError(SERVER_ERROR, '500')
      }
    },
  },
  Mutation: {
    addMovie: async (parent, args, ctx) => {
      try {
        const payload = await authenticate(ctx.token)
        if (!payload) return new AuthenticationError(UNAUTHORIZED)

        const movie = new ctx.Movie({
          movieID: prop('movieID')(args),
          name: prop('name')(args),
          description: prop('description')(args),
        })
        await movie.save()

        return movie
      } catch (e) {
        if (e.errmsg && e.errmsg.split(':')[0] === 'E11000 duplicate key error index') {
          return new UserInputError(MOVIE_ID_ALREADY_EXISTS)
        }
        console.log(e)
        return new ApolloError(SERVER_ERROR, '500')
      }
    },

    deleteMovie: async (parent, args, ctx) => {
        try {
          const payload = await authenticate(ctx.token)
          if (!payload) return new AuthenticationError(UNAUTHORIZED)

          const movie = await ctx.Movie.findOne({ movieID: prop('movieID')(args)})
          if (!movie) return new UserInputError(MOVIE_NOT_FOUND)
          if(movie.isDeleted) return new UserInputError(MOVIE_ALREADY_DELETED)
          
          movie.isDeleted = true
          await movie.save()

          return movie._id
        }
        catch(e){
            console.log(e)
            return new ApolloError(SERVER_ERROR, '500')
        }
    }
  },
}

export default resolvers
