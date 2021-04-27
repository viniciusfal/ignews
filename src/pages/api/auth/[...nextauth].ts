import NextAuth from 'next-auth';
import Providers from 'next-auth/providers';
import { query as q } from 'faunadb';

import { fauna } from '../../../services/fauna';

export default NextAuth({
  providers: [
    Providers.GitHub({
      clientId: process.env.GITHUB_ID,
      clientSecret: process.env.GITHUB_SECRET,
      scope: 'read:user',
      
    }),
  ],

  callbacks: {
    async signIn(user, account, profile) {
      const { email } = user

      try {
        await fauna.query(
         q.If(
           q.Not(
             q.Exists(
               q.Match(
                 q.Index('users_by_email'), // Índice do banco de dados
                 q.Casefold(user.email)
               )
             )
           ),
           q.Create(
            q.Collection('users'), // Nome da tabela
            { data: { email } }
          ),
          q.Get(
            q.Match(
              q.Index('user_by_email'),
              q.Casefold(user.email)
            )
          )
         )
        )
        return true
      } catch {
        return false
      }
      
    },
  }
})