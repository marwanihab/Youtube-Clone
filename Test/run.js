import appModule from '../modules/app'
import { createTestClient } from 'apollo-server-testing'
import { ApolloServer } from 'apollo-server'
import { token } from './user-resolvers-test.test'

// const server = new ApolloServer({
//   schema:  appModule.schema,
//   context: () => ({ token: token })
// }) 

// export const { query, mutate } = createTestClient(server)


