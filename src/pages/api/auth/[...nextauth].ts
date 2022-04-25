import NextAuth from "next-auth"
import GithubProvider from "next-auth/providers/github"
import { query as q } from 'faunadb'
import {fauna} from '../../../services/fauna'

export default NextAuth({
  // Configure one or more authentication providers
  providers: [
    GithubProvider({
      clientId: process.env.GITHUB_CLIENT_ID,
      clientSecret: process.env.GITHUB_CLIENT_SECRET,
      authorization: {
          params:{
              scope: 'read:user'
          }
      }
    }),
    // ...add more providers here
  ],
  callbacks: {

    async session({session}){
      try {
        const userActiveSubscription = await fauna.query(
          q.Get(
            // Intersection é a interseção de dois valores, ou seja retorna apenas o valor que bate nos dois Matchs
            q.Intersection([
              q.Match(
                q.Index('subscription_by_user_ref'),
                q.Select(
                  "ref",
                  q.Get(
                    q.Match(
                      q.Index('user_by_email'),
                      q.Casefold(session.user.email)
                    )
                  )
                )
              ),
              q.Match(
                q.Index('subscription_by_status'),
                "active"
              )
            ])
          )
        )
        return {
          ...session,
          activeSubscription: userActiveSubscription
        }
      } catch (error) {
         return {
            ...session,
            activeSubscription: null
         }
      }
    },

    async signIn({ user, account, profile }) {
      const { email } = user;
      //FQL Fauna Query Language
      try{
        await fauna.query(
          q.If(
            //Verificação
            q.Not(
              q.Exists(
                q.Match(
                  q.Index('user_by_email'),
                  q.Casefold(email)
                )
              )
            ),
            //realiza caso retorne que não existe
            q.Create(
              q.Collection('users'),
              {data:{email}}
            ),
            //se já existe (else do not exists)
            q.Get(
              q.Match(
                q.Index('user_by_email'),
                q.Casefold(email)
              )
            )
          )
        )
        return true
      }catch(err){
        return false
      }
      
    },
  }
})

// BD para serveless

// Não precisam manter um pool de conexão
//FaunaDB - HTTP
//DynamoDB - AWS

//Precisam manter pool de conexão (mais custoso para o BD se usado com dinamica serveless)
// PostgreSQL, MongoDB

// Indices em banco de dados para busca

// [
//   0: {"id": 1, "name": "Nicolas", "email": "nico@gmail.com"},
//   1: {"id": 2, "name": "Luis", "email": "luis@gmail.com"},
//   2: {"id": 3, "name": "Maria", "email": "maria@gmail.com"},
// ]

// user_by_email
// [
//   "nico@gmail.com": {"id": 1, "name": "Nicolas", "email": "nico@gmail.com"},
//   "luis@gmail.com": {"id": 2, "name": "Luis", "email": "luis@gmail.com"},
//   "maria@gmail.com": {"id": 3, "name": "Maria", "email": "maria@gmail.com"},
// ]