import { GraphQLModule } from '@graphql-modules/core'
import typeDefs from './typeDefs'
import resolver from './resolvers'
import User from '../../mongoose-models/User'

const user = new GraphQLModule({
  typeDefs,
  resolvers: resolver,
  context: (ctx) => ({ token: ctx.token, User }),
})

export default user
