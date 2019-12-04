import { GraphQLModule } from '@graphql-modules/core'
import typeDefs from './typeDefs'
import resolver from './resolvers'
import Movie from '../../mongoose-models/Movie'

const movie = new GraphQLModule({
  typeDefs,
  resolvers: resolver,
  context: (ctx) => ({ token: ctx.token, Movie }),
})

export default movie
