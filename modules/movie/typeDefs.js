import { gql } from 'apollo-server'

const typeDefs = gql`

type Movie{
    _id: ID
    movieID: String
    name: String
    description: String
    sharedBy: String
    likedBy: [String]
    dislikedBy: [String]
}

type MoviesResponse {
    items: [Movie]
    totalCount: Int
    isSigned: Boolean
  }

enum action {
  UP
  Down
}

type Query {
 
  getMovies(movieID: String, name:String, description:String, sharedBy: String, page: Int pageSize: Int isDeleted: Boolean): MoviesResponse

  
}

type Mutation {
  addMovie(
    movieID: String!,
    name: String,
    description: String,
    sharedBy: String!,
  ): Movie
   
  voteForMovie(movieID: String!,
  name:String!,
  action: action!
  ): String

  deleteMovie(
    movieID: String!

  ): String
}
`

export default typeDefs
