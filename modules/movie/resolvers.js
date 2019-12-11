import { AuthenticationError, ApolloError, UserInputError } from 'apollo-server'
import { prop, propOr, isEmpty, path } from 'ramda'
import {  authenticate } from '../../auth'
import axios from 'axios'
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
        let isSigned = false
        const payload = await authenticate(ctx.token)
        isSigned = payload ? true : false

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
        

        return { totalCount: count, items: movies, isSigned:isSigned }
      } catch (e) {
        console.log(e)
        return new ApolloError(SERVER_ERROR, '500')
      }
    },

    // getLikes:  async (parent, args, ctx) => {
      
    //   try {
    //       const movie = await ctx.Movie.findOne({ movieID: prop('movieID')(args), isDeleted: false })
    //       const likesArray = movie.likedBy
    //       return(likesArray)
    //   }catch(e){
    //     console.log(e)
    //     return new ApolloError(SERVER_ERROR, '500')
    //   }     
    // }
  },
  Mutation: {
    addMovie: async (parent, args, ctx) => {
      try {
        
        const payload = await authenticate(ctx.token)
        if (!payload) return new AuthenticationError(UNAUTHORIZED)
        
        const res = await  axios.get(`https://www.googleapis.com/youtube/v3/videos?part=snippet&id=${prop('movieID')(args)}&fields=items/snippet/title,items/snippet/description&key=AIzaSyCbn-Qs9i8FQuodHvLQmZ7dL55H-J5qefA`)
        const description = res.data.items[0].snippet.description
        const title = res.data.items[0].snippet.title
        
        const movie = new ctx.Movie({
          movieID: prop('movieID')(args),
          name: propOr(title, 'name')(args),
          description: propOr(description,'description')(args),
          sharedBy: prop('sharedBy')(args),
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

    voteForMovie: async (parent, args, ctx) => {
      try {

        const payload = await authenticate(ctx.token)
        if (!payload) return new AuthenticationError(UNAUTHORIZED)
  
        const name = prop('name')(args)
        const action = prop('action')(args) 
        const movie = await ctx.Movie.findOne({ movieID: prop('movieID')(args), isDeleted: false })
  
        if(action === 'UP'){
            const likes = movie.likedBy 
            const dislikes = movie.dislikedBy
            if(dislikes.includes(name)){
              dislikes.splice( dislikes.indexOf(name), 1 )
              movie.dislikedBy = dislikes
            }
            if(!likes.includes(name)){
            likes.push(name)
            movie.likedBy = likes
            await movie.save()
          }
        }else{
          const dislikes = movie.dislikedBy 
          const likes = movie.likedBy
         
          if(likes.includes(name)){
            likes.splice( likes.indexOf(name), 1 )
            movie.likedBy = dislikes
          }
          if(!dislikes.includes(name)){
            dislikes.push(name)
            movie.dislikedBy = dislikes  
            await movie.save()
          }
        }
        return( name )
        }
          catch(e){
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
