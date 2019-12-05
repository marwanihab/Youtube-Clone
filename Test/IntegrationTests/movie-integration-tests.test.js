import appModule from '../../modules/app'
import { createTestClient } from 'apollo-server-testing'
import { ApolloServer } from 'apollo-server'
import {Models, connectDb } from '../db-test'
import { expect } from 'chai'
import { gql } from 'apollo-server'
//import {query, mutate} from './user-integration-tests.test'


import {before, after, it, describe} from 'mocha'

const server = new ApolloServer({
    schema:  appModule.schema,
    context: () => ({ token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VybmFtZSI6InRlc3RVc2VyIiwiaWF0IjoxNTc1NDI2NzI2fQ.kWQQdaUWlUmY40dkZ4igKQ0Ml_BwrLVdoQebkqsZOVU' })
    }) 

const { query , mutate } = createTestClient(server)  
  
before(function (){
    connectDb()
})
after(async function(){
    
    await Models.movie.deleteMany({})
    await Models.user.deleteMany({})
}
)

describe('Running integration tests of the movie', function() {
    this.timeout(15000)

    it('should get movies', async() =>{

        const movie = await Models.movie.create({movieID:'testMovieIntegration'})
 
        const que = gql `
         query getMovies{
           getMovies(movieID: "testMovieIntegration"){
             items{
                 movieID
             }
           }
         }
        `
        const res = await query(
              {query : que}
            )   
            //console.log(res.data.getMovies.items[0].movieID)        
        expect(res.data.getMovies.items[0].movieID).to.equal(movie.movieID)
     
       })
   
       it('should fail when get movies with wrong movieID', async() =>{
   
        await Models.movie.create({movieID:'testMovieIntegrationFail'}) 
        
        const que = gql `
         query getMovies{
           getMovies(movieID: "testUserIntegrationFailFail"){
             items{
                movieID
             }
             totalCount
           }
         }
        `
        const res = await query(
              {query : que}
            )  
       //console.log(res.data.items)      
        expect(res.data.getMovies.totalCount).to.equal(0)
     
        
       })
   
       
   
       it('should add movie', async() =>{
    
         const mutation = gql `
         mutation addMovie{
            addMovie(movieID: "testMovieIntegrationAdd"){
                 movieID
             }
            }
         `
         const res = await mutate(
               {mutation : mutation}
             )   
         expect(res.data.addMovie.movieID).to.equal('testMovieIntegrationAdd')
    
      
        })
   
        it('should fail when adding user with an existed movieID', async() =>{
        
         const movie = await Models.movie.create({movieID:'testMovieIntegrationFailAdded'}) 
         await movie.save()
   
         const mutation = gql `
          mutation addMovie{
           addMovie(movieID: "testMovieIntegrationFailAdded"){
               movieID
            }
          }
         `
         const res = await mutate(
               {mutation : mutation}
             )  
             
         expect(res.errors[0].message).to.equal('movieID already exists')
      
         
        })
   
        it('should delete movie', async() =>{
   
         const movie = await Models.movie.create({movieID:'testMovieDelete'})
         
         await movie.save()  
    
         const mutation = gql `
         mutation deleteMovie{
           deleteMovie(movieID: "testMovieDelete")
   
            }
         `
         const res = await mutate(
           {mutation : mutation}
         )         
         expect(res.data.deleteMovie).to.be.a('string')
   
        })
   
        it('should fail when deleting user with wrong movieID', async() =>{
         
         const movie = await Models.movie.create({movieID:'testMovieDeleteFail'})
         
         await movie.save()  
    
         const mutation = gql `
         mutation deleteMovie{
           deleteMovie(movieID:"testMovieDeleteFailFail")
              
            }
         `
         const res = await mutate(
           {mutation : mutation}
         )         
             
         expect(res.errors[0].message).to.equal('MOVIE not found')
      
         
        })
})
    