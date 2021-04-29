import { NextApiRequest, NextApiResponse } from "next";
import { getSession } from "next-auth/client";
import { stripe } from "../../services/stripe";

export default async (req: NextApiRequest, res: NextApiResponse) => {
    if(req.method === 'POST') {

        const session = await getSession({ req })

        const stripeCustomer = await stripe.customers.create({
            email: session.user.email, // o E-mail agora é obrigatório
        })

        const stripeCheckoutSession = await stripe.checkout.sessions.create({
            customer: stripeCustomer.id, // O id do produto que esta no stripe, e não no faunaDB
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