import { gql } from 'apollo-server'

const typeDefs = gql`

type Movie{
    _id: ID
    movieID: String
    name: String
    description: String
}

type MoviesResponse {
    items: [String]
    totalCount: Int
  }


type Query {
  getMovie(
      _id: ID!
  ): String

  getMovies(movieID: String, name:String, description:String, page: Int pageSize: Int isDeleted: Boolean): MoviesResponse
}

type Mutation {
  addMovie(
    movieID: String!,
    name: String,
    description: String
  ): String


  deleteMovie(
    movieID: String!

  ): String
}
`

export default typeDefs
