import appModule from '../../modules/app'
import { createTestClient } from 'apollo-server-testing'
import { ApolloServer } from 'apollo-server'
import { Models, connectDb } from '../db-test'
import { expect } from 'chai'
import { gql } from 'apollo-server'
import { hashPassword } from '../../auth'
import {before, after, it, describe} from 'mocha'

export const server = new ApolloServer({
    schema:  appModule.schema,
    context: () => ({ token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VybmFtZSI6InRlc3RVc2VyIiwiaWF0IjoxNTc1NDI2NzI2fQ.kWQQdaUWlUmY40dkZ4igKQ0Ml_BwrLVdoQebkqsZOVU' })
    }) 

export const { query, mutate } = createTestClient(server)  
  
before(function (){
    connectDb()
})
after(async function(){
  
  await Models.movie.deleteMany({})
  await Models.user.deleteMany({})

})

describe('Running integration tests of the user', function() {
    this.timeout(15000)

    it('should login user', async() =>{
     const password = await hashPassword("M123456?m", "testUserIntegration")
     const user = await Models.user.create({username:'testUserIntegration', password:password})
     
     await user.save()

     const mutation = gql `
      mutation logIn{
        login(username: "testUserIntegration", password:"M123456?m"){
          token
          username
        }
      }
     `
     const res = await mutate(
           {mutation : mutation}
         )   
     expect(res.data.login.username).to.equal('testUserIntegration')
  
    })

    it('should fail when login user with wrong password', async() =>{
     const password = await hashPassword("M123456?m", "testUserIntegrationFail")
     const user = await Models.user.create({username:'testUserIntegrationFail', password:password}) 
     await user.save()
     
     const mutation = gql `
      mutation logIn{
        login(username: "testUserIntegrationFail", password:"M123456?r"){
          token
          username
        }
      }
     `
     const res = await mutate(
           {mutation : mutation}
         )  
         
     expect(res.errors[0].message).to.equal('invalid credentials')
  
     
    })

    

    it('should add user', async() =>{
 
      const mutation = gql `
      mutation addUser{
          addUser(username: "testUserAdded", password:"M123456?m"){
            token
            username
          }
         }
      `
      const res = await mutate(
            {mutation : mutation}
          )   
      expect(res.data.addUser.username).to.equal('testUserAdded')
 
   
     })

     it('should fail when adding user with an existed username', async() =>{
      const password = await hashPassword("M123456?m", "testUserIntegrationFailAdded")
      const user = await Models.user.create({username:'testUserIntegrationFailAdded', password:password}) 
      await user.save()

      const mutation = gql `
       mutation addUser{
        addUser(username: "testUserIntegrationFailAdded", password:"M123456?m"){
           token
           username
         }
       }
      `
      const res = await mutate(
            {mutation : mutation}
          )  
          
      expect(res.errors[0].message).to.equal('username already exists')
   
      
     })

     it('should fail when adding user with a wrong password format', async() =>{
      const mutation = gql `
       mutation addUser{
        addUser(username: "testUserIntegrationFailAddedPassword", password:"M12345"){
           token
           username
         }
       }
      `
      const res = await mutate(
            {mutation : mutation}
          )  
          
      expect(res.errors[0].message).to.equal('password must contain an uppercase letter, a lowercase letter and a number.')
   
      
     })


     it('should edit user', async() =>{
      const password = await hashPassword("M123456?m", "testUserEdit")
      const user = await Models.user.create({username:'testUserEdit', password:password})
      
      await user.save()

      const mutation = gql `
      mutation editUser{
          editUser(username: "testUserEdit", password:"M123456?m", newPassword:"M123456?r")
           
         }
      `
      const res = await mutate(
            {mutation : mutation}
          )   
        
      expect(res.data.editUser).to.equal('PASSWORD changed succesfuly')
     })

     it('should fail when editting user with wrong username', async() =>{
      const password = await hashPassword("M123456?m", "testUserIntegrationFailEdit")
      const user = await Models.user.create({username:'testUserIntegrationFailEdit', password:password}) 
      await user.save()
      
      const mutation = gql `
       mutation editUser{
        editUser(username: "testUserIntegrationFailE", password:"M123456?m", newPassword:"M123456?r")
       }
      `
      const res = await mutate(
            {mutation : mutation}
          )  
          
      expect(res.errors[0].message).to.equal('USER not found')
   
      
     })

     it('should fail when editting user with wrong password', async() =>{
      const password = await hashPassword("M123456?m", "testUserIntegrationFailEditPassword")
      const user = await Models.user.create({username:'testUserIntegrationFailEditPassword', password:password}) 
      await user.save()
      
      const mutation = gql `
       mutation editUser{
        editUser(username: "testUserIntegrationFailEditPassword", password:"M123456?r", newPassword:"M123456?r")
       }
      `
      const res = await mutate(
            {mutation : mutation}
          )  
          
      expect(res.errors[0].message).to.equal('invalid credentials')
   
      
     })
 

     it('should delete user', async() =>{

      const password = await hashPassword("M123456?m", "testUserDelete")
      const user = await Models.user.create({username:'testUserDelete', password:password})
      
      await user.save()  
 
      const mutation = gql `
      mutation deleteUser{
         deleteUser(username: "testUserDelete")
           
         }
      `
      const res = await mutate(
        {mutation : mutation}
      )         
      expect(res.data.deleteUser).to.be.a('string')

     })

     it('should fail when deleting user with wrong username', async() =>{
      const password = await hashPassword("M123456?m", "testUserDeleteFail")
      const user = await Models.user.create({username:'testUserDeleteFail', password:password})
      
      await user.save()  
 
      const mutation = gql `
      mutation deleteUser{
         deleteUser(username: "testUserDeleteDel")
           
         }
      `
      const res = await mutate(
        {mutation : mutation}
      )         
          
      expect(res.errors[0].message).to.equal('USER not found')
  
     })
})
    