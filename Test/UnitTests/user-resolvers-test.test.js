import {Models, connectDb, disconnectDb, generateMongooseId, cleanDb } from '../db-test'
import resolver from '../../modules/user/resolvers'
import { expect } from 'chai'
import 'mocha'



before(function (){
    connectDb()
})
after(function(){disconnectDb()})

var loginToken = ""


describe('Running unit tests of the user', function() {
       this.timeout(20000)
        it('should add user', async ()=>{
            const result = await resolver.Mutation.addUser({}, {username: 'testUser',  password:'M123456?m'}, {User: Models.user})
            const user = await Models.user.findOne({username: 'testUser', isDeleted:'false'})
            expect(result.username + '').to.equal(user.username + '')
            
        })  

        it('should fail when adding an existed username', async()=> {
            const result = await resolver.Mutation.addUser({}, {username: 'testUser',  password:'M123456?m'}, {User: Models.user})
            expect(result + '').to.equal('UserInputError: username already exists')
        })

        it('should fail when adding a wrong password format', async()=> {
            const result = await resolver.Mutation.addUser({}, {username: 'testUser',  password:'M123456'}, {User: Models.user})
            expect(result + '').to.equal('UserInputError: password must contain an uppercase letter, a lowercase letter and a number.')
        })


        loginToken = ""
        it('should login user', async ()=>{
            const result = await resolver.Mutation.login({}, {username: 'testUser',  password:'M123456?m'}, {User: Models.user})
            loginToken = result.token
            const user = await Models.user.findOne({username: 'testUser', isDeleted:'false'})
            expect(result.username + '').to.equal(user.username + '')


        })  

        it('should fail when login with wrong wrong password', async ()=> {
            const result = await resolver.Mutation.login({}, {username: 'testUser',  password:'M12345?r'}, {User: Models.user})
            expect(result + '').to.equal('AuthenticationError: invalid credentials')
        })

        it('should edit user', async ()=>{
            const result = await resolver.Mutation.editUser(
                {}, {
                    username: 'testUser',  
                    password:'M123456?m',
                    newPassword:'M123456?r'
                }, 

                    {User: Models.user,
                    token : loginToken    
                    } )
            expect(result + '').to.equal('PASSWORD changed succesfuly')        

        })
        
        it('should fail when editting with wrong username', async ()=> {
            const result = await resolver.Mutation.editUser(
                {}, {
                    username: 'test',  
                    password:'M123456?m',
                    newPassword:'M123456?r'
                }, 

                    {User: Models.user,
                    token : loginToken    
                    } )

            expect(result + '').to.equal('UserInputError: USER not found')
        })
        
        it('should fail when editting with wrong password credential', async ()=> {
            const result = await resolver.Mutation.editUser(
                {}, {
                    username: 'testUser',  
                    password:'M123456?m',
                    newPassword:'M123456?r'
                }, 

                    {User: Models.user,
                    token : loginToken    
                    } )

            expect(result + '').to.equal('AuthenticationError: invalid credentials')
        })

        it('should fail when editting with wrong password format', async ()=> {
            const result = await resolver.Mutation.editUser(
                {}, {
                    username: 'testUser',  
                    password:'M123456?r',
                    newPassword:'M123456'
                }, 

                    {User: Models.user,
                    token : loginToken    
                    } )

            expect(result + '').to.equal('UserInputError: password must contain an uppercase letter, a lowercase letter and a number.')
        })


        it('should delete user', async() =>{
            const result = await resolver.Mutation.deleteUser(
                {}, {
                    username: 'testUser',  
                }, 

                    {User: Models.user,
                    token : loginToken    
                    }
            )
            const user = await Models.user.findOne({_id: result})
            expect(user.isDeleted + '').to.equal('true')

        })

        it('should fail when delete with wrong username', async() =>{
            console.log(loginToken)
            const result = await resolver.Mutation.deleteUser(
                {}, {
                    username: 'test',  
                }, 

                    {User: Models.user,
                    token : loginToken    
                    }
            )
            expect(result + '').to.equal('UserInputError: USER not found')
        })
            
   
    })


export const token = loginToken
