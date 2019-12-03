import { gql } from 'apollo-server'

const typeDefs = gql`
type Query {
  # empty query
  _: Boolean
}

type Mutation {
  addUser(
    username: String!
    password: String!
    
  ): String

  login(
    username: String!
    password: String!
  ): String

  editUser(
    username: String!
    newPassword: String!
  ): String

  deleteUser(
    username: String!
  ): String
}
`

export default typeDefs
