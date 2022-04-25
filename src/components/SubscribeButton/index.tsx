import { useSession, signIn } from 'next-auth/react'
import { useRouter } from 'next/router';
import { api } from '../../services/api';
import { getStripeJs } from '../../services/stripe-js';
import styles from './styles.module.scss'

interface SubscribeButtonProps {
    priceId: string
}

// Uso de chaves de api secretas apenas em:

// UTILIZADOS APENAS QUANDO PAGINA ESTIVER SENDO RENDERIZADA
// getServerSideProps (SSR)
// getStaticProps (SSG)

// APARTIR DE AÇÃO DO USUÁRIO
// API routes

export function SubscribeButton({priceId}:SubscribeButtonProps){
    const {data:session, status} = useSession()
    const router = useRouter()

    async function handleSubscribe(){
        if(status != "authenticated"){
            signIn('github')
            return;
        }

        if(session.activeSubscription){
            router.push('/posts')
            return;
        }

        // CRIAÇÃO DA CHECKOUT SESSION
        try{
            // rota subscribe em api/subscribe
            const response = await api.post('/subscribe')

            const { sessionId } = response.data

            const stripe = await getStripeJs()

            stripe.redirectToCheckout({sessionId: sessionId})
        } catch(err){
            alert(err.message)
        }
    }


    return(
        <button 
            type="button"
            className={styles.subscribeBttton}
            onClick={handleSubscribe}
        >
            Subscribe now
        </button>
    )
}