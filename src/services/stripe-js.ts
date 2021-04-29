import { loadStripe } from '@stripe/stripe-js';

export async function getStripeJs() {
    const stripeJs = await loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLIC_KEY) // O NEXT_PUBLIC no ínicio da variavel faz com que ela se torne acessível no frontend(publica)

    return stripeJs;
}