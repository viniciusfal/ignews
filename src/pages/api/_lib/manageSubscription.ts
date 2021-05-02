import { fauna } from "../../../services/fauna";
import {query as q } from 'faunadb';
import { stripe } from "../../../services/stripe";

export async function saveSubscription(
    subscriptionId: string,
    customerId: string,
    createAction = false,
) {
    // Buscar o usuário no faunaDb com o Id {cstomer_id}

    const userRef = await fauna.query(
       q.Select(
           "ref",  // só quero o campo ref
           q.Get(
            q.Match(
                q.Index('user_by_stripe_customer_id'),
                customerId
            )
          )
       )
    )

    const subscription = await stripe.subscriptions.retrieve(subscriptionId)

    //Salvar od dados da subscription do usuário
    const subscriptionData = {
        id: subscription.id,
        userId: userRef,
        status: subscription.status,
        price_id: subscription.items.data[0].price.id, // data[0] é porque o cliente só vai comprar um produto por vez.
    }
 // se estou criando uma subscription
    if(createAction) {
        await fauna.query(
            q.Create(
                q.Collection('subscriptions'),
                { data: subscriptionData }
            )
        )
    
// se estou atualizando uma subscription já existente
    } else {
        await fauna.query(

            q.Replace(
                q.Select(
                    "ref",
                    q.Get(
                        q.Match(
                            q.Index('subscription_by_id'),
                            subscription.id
                        )
                    )
                ),
                {data:subscriptionData}
            )
        )
    }

   



}