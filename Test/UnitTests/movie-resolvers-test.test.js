import {Models, connectDb } from '../db-test'
import resolver from '../../modules/movie/resolvers'
import { expect } from 'chai'
import {before, after, describe, it } from 'mocha'
import {loginToken} from './user-resolvers-test.test'


before(function (){
    connectDb()
})

after(async function(){

    await Models.movie.deleteMany({})
    await Models.user.deleteMany({})
})



describe('Running unit tests of the movie', function() {
       this.timeout(20000)
        it('should add movie', async ()=>{
            const result = await resolver.Mutation.addMovie({}, { 
                movieID: '123',
                name: 'movieTest',
                description: 'Test Descrip'}, 
                {Movie: Models.movie,
                token : loginToken   
                })
            const movie = await Models.movie.findOne({movieID: '123', isDeleted:'false'})
            expect(result.movieID + '').to.equal(movie.movieID + '')
            
        })  

        it('should fail when adding an existed movieID', async()=> {
            const result = await resolver.Mutation.addMovie({}, { 
                movieID: '123',
                name: 'movieTest',
                description: 'Test Descrip'}, 
                {
                    Movie: Models.movie,
                    token : loginToken   
                    }
                )
            expect(result + '').to.equal('UserInputError: movieID already exists')
        })

        it('should get all movies', async ()=>{

            const movie = await Models.movie.create({movieID:'12345'})
            await movie.save()

            const result = await resolver.Query.getMovies({}, 
                {
                    movieID:'12345'
                },
                {Movie: Models.movie,
                token : loginToken   
                })
            expect(result.items[0].movieID + '').to.equal(movie.movieID + '')
            
        })  

        it('should fail when get all movies with wrong movieID', async ()=>{
            const movie = await Models.movie.create({movieID:'123456'})
            await movie.save()

            const result = await resolver.Query.getMovies({}, 
                {
                    movieID:'1'
                },
                {Movie: Models.movie,
                token : loginToken   
                })
            console.log(result);
            
            expect(result.totalCount).to.equal(0)
            
        })  
        

        it('should delete movie', async() =>{
            const result = await resolver.Mutation.deleteMovie(
                {}, {
                    movieID: '123',  
                }, 
                    {Movie: Models.movie,
                    token : loginToken    
                    }
            )
            const movie = await Models.movie.findOne({_id: result})
            expect(movie.isDeleted + '').to.equal('true')

        })

        it('should fail when delete with wrong movieID', async() =>{
            
            const result = await resolver.Mutation.deleteMovie(
                {}, {
                    movieID: '12',  
                }, 
                    {Movie: Models.movie,
                    token : loginToken    
                    }
            )
            expect(result + '').to.equal('UserInputError: MOVIE not found')
        })

        it('should fail when delete movie already deleted', async() =>{
            
            const result = await resolver.Mutation.deleteMovie(
                {}, {
                    movieID: '123',  
                }, 

                    {Movie: Models.movie,
                    token : loginToken    
                    }
            )
            expect(result + '').to.equal('UserInputError: MOVIE is already deleted')
        })



            
   
    })


