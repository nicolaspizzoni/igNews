import { fauna } from './../../services/fauna';
import {query as q} from 'faunadb'
import { NextApiRequest, NextApiResponse } from "next";
import { getSession } from 'next-auth/react'
import {stripe} from '../../services/stripe'

type User = {
    ref: {
        id: string
    }
    data: {
        stripe_customer_id: string
    }
}

export default async (req:NextApiRequest, res:NextApiResponse) => {
    // apenas aceita requisições do tipo POST (criando checkout session)
    if(req.method === "POST") {
        //Acessando pelo cookie, que é visível para front e backend (token = req.cookies)
        const session = await getSession({req})

        //busca o usuario no fauna que de match com o email do usuario logado
        const user = await fauna.query<User>(
            q.Get(
                q.Match(
                    q.Index('user_by_email'),
                    q.Casefold(session.user.email)
                )
            )
        )

        let customerId = user.data.stripe_customer_id

        if(!customerId){
            
            //Cria o cliente com o email no painel do stripe para pegar o id do cliente no stripe
            const stripeCustomer = await stripe.customers.create({
                email: session.user.email
            })
    
            // <User> => generic
    
            //atualiza o usuario na collection users
            await fauna.query(
                q.Update(
                    q.Ref(q.Collection('users'), user.ref.id),
                    {
                        data: {
                            stripe_customer_id: stripeCustomer.id
                        }
                    }
                )
            )

            customerId = stripeCustomer.id
        }


        const stripeCheckoutSession = await stripe.checkout.sessions.create({
            customer: customerId,
            payment_method_types: ['card'],
            billing_address_collection: 'required',
            line_items: [
                {price: 'price_1KFlPSFbxPejS6mbfTaa5hSV', quantity: 1}
            ],
            mode: 'subscription',
            allow_promotion_codes: true,
            success_url: process.env.STRIPE_SUCESS_URL,
            cancel_url: process.env.STRIPE_CANCEL_URL,

        })

        return res.status(200).json({sessionId: stripeCheckoutSession.id})
    }else {
        //Explicando que apenas aceita POST
        res.setHeader('Allow', 'POST');
        res.status(405).end('Method not allowed')
    }
}