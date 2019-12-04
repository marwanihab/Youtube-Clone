import { GraphQLModule } from '@graphql-modules/core'
import user from '../user'
import movie from '../movie'


const appModule = new GraphQLModule({
  imports: [
    user,
    movie,
  ],
})

export default appModule
