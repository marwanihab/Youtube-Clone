import { gql } from 'apollo-server'

const typeDefs = gql`

type Movie{
    _id: ID
    movieID: String
    name: String
    description: String
}

type MoviesResponse {
    items: [Movie]
    totalCount: Int
  }



type Query {
 
  getMovies(movieID: String, name:String, description:String, page: Int pageSize: Int isDeleted: Boolean): MoviesResponse
}

type Mutation {
  addMovie(
    movieID: String!,
    name: String,
    description: String
  ): Movie


  deleteMovie(
    movieID: String!

  ): String
}
`

export default typeDefs
