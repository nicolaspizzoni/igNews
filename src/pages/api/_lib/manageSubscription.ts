/* Pastas e arquivos criados com _ não são tratados como rota nem na api nem na pages*/
import {query as q} from 'faunadb'
import { fauna } from "../../../services/fauna";
import { stripe } from '../../../services/stripe';

export async function saveSubscription(
    subscriptionId: string,
    customerId: string,
    createAction = false
){
    //Buscar o usuário no banco do FaunaDB com o ID {customerID}
    //Salvar os dados da subscription {subscriptionId} no FaunaDB

    const userRef = await fauna.query(
        //Selecionando apenas o campo que quero que retorne
        q.Select(
            "ref",
            q.Get(
                q.Match(
                    q.Index('user_by_stripe_customer_id'),
                    customerId
                )
            )
        )
    )

    //pegando a subscription pela subscriptionId
    const subscription = await stripe.subscriptions.retrieve(subscriptionId)

    // Como quero salvar apenas dados especificos crio um objeto com esses dados invés de mandar toda a subscription
    const subscriptionData = {
        id: subscription.id,
        userId: userRef,
        status: subscription.status,
        price_id: subscription.items.data[0].price.id
    }

    //criando registro na collection subscriptions
    if(createAction){
        await fauna.query(
            q.Create(
                q.Collection('subscriptions'),
                {data: subscriptionData}
            )
        )
    }else{
        await fauna.query(
            /* 
            Replace: atualiza todo o Document
            Update: pode atualizar/adicionar uma linha específica do Document
            */
            q.Replace(
                //pegar o Document pela ref que bata com o subscriptionId
                q.Select(
                    "ref",
                    q.Get(
                        q.Match(
                            q.Index("subscription_by_id"),
                            subscriptionId,
                        )
                    )
                ),
                //dado para substituir
                {data: subscriptionData}
            )
        )
    }
}