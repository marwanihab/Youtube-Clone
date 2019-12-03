import { GraphQLModule } from '@graphql-modules/core'
import user from '../user'


const appModule = new GraphQLModule({
  imports: [
    user,
  ],
})

export default appModule
