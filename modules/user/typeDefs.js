import { gql } from 'apollo-server'

const typeDefs = gql`
type Query {
  # empty query
  _: Boolean
}
type User{
  token:String
  username:String
}


type Mutation {
  addUser(
    username: String!
    password: String!
    
  ): User

  login(
    username: String!
    password: String!
  ): User

  editUser(
    username: String!
    password: String!
    newPassword: String!
  ): String

  deleteUser(
    username: String!
  ): String
}
`

export default typeDefs
