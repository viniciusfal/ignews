import { NextApiRequest, NextApiResponse } from "next";
import { getSession } from "next-auth/client";
import {query as q} from 'faunadb';

import { fauna } from "../../services/fauna";
import { stripe } from "../../services/stripe";

type User = {
    ref: {
        id: string,
    }
    data: { 
        stripe_customer_id: string,
    }
}

export default async (req: NextApiRequest, res: NextApiResponse) => {


    if(req.method === 'POST') {

        const session = await getSession({ req })

        // Selecionar usuário por email
    const user = await fauna.query<User>(
        q.Get(
            q.Match(
                q.Index('users_by_email'),
                q.Casefold(session.user.email),
            )
        )
    )
    
    // Evitar que o usuário seja duplicado///
    let customerId = user.data.stripe_customer_id
    
    if(!customerId) {
        const stripeCustomer = await stripe.customers.create({
            email: session.user.email, // o E-mail agora é obrigatório
        })

        await fauna.query(
            q.Update(
                q.Ref(q.Collection('users'), user.ref.id),
                {
                    data: { 
                        stripe_customer_id: stripeCustomer.id,
                    }
                }
            )
        )
        
        customerId = stripeCustomer.id;
    }

        const stripeCheckoutSession = await stripe.checkout.sessions.create({
            customer: customerId, // O id do produto que esta no stripe, e não no faunaDB
            payment_method_types: ['card'], // Pagamento no cartão
            billing_address_collection: 'required', // Quero obrigar que o cliente preencha o endereço
            line_items: [ // itens
                {price: 'price_1IjFI6AO2tT8Hg9QsZMzbOOP', quantity: 1}
            ],
            mode: 'subscription', //pagamento recorrente
            allow_promotion_codes: true,
            success_url: process.env.STRIPE_SUCCESS_URL,
            cancel_url: process.env.STRIPE_CANCEL_URL,
        })

        return res.status(200).json({ sessionId: stripeCheckoutSession.id })
    } else {
        res.setHeader('Allow', 'POST')
        res.status(405).end('Method not allowed')
    }
}