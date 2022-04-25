import { GetStaticProps } from 'next'
import Head from 'next/head'
import styles from './home.module.scss'
import { SubscribeButton } from '../components/SubscribeButton'
import { stripe } from '../services/stripe'

interface HomeProps {
  product: {
    priceId: string;
    amount: number;
    name: string;
  }
}

//3 TIPOS DE CHAMADAS A API

//Client-side - Sem indexação, informação que carrega atráves de ação do usuário e não necessáriamente quando a pagina carrega

//Permitem indexação do Google:
//Server-side - Informações em tempo real somente do usuário, leva mais tempo para trazer as infos
//Static Site Generation - salva e compartilha a informação/html com todos os usuários que acessam a mesma pagina


//EXEMPLO: Post Blog
//Conteudo (SSG) -> mesmo conteudo pra todos que acessarem
//Comentários (Client-side) -> permite em tempo real, traz depois da pagina ter carregado

export default function Home({product}:HomeProps) {
  return (
    <>
      {/*Tudo que for jogado dentro do Head é colocado no Head do _document*/}
      <Head>
        <title>Home | ig.news</title>
      </Head>
      <main className={styles.contentContainer}>
        <section className={styles.hero}>
          <span>👏 Hey, welcome</span>
          <h1>News about <br /> the <span>React</span> world.</h1>
          <p>
            Get acess to all the {product.name} <br />
            <span>for {product.amount} month.</span>
          </p>
          <SubscribeButton priceId={product.priceId}/>
        </section>
        <img src="/images/avatar.svg" alt="Girl codding"/>
      </main>
    </>
  )
} 

//executado dentro do servidor node (Next) SSR - EXECUTADO NA RENDERIZAÇÂO
export const getStaticProps : GetStaticProps = async () => {
  const price = await stripe.prices.retrieve('price_1KFlPSFbxPejS6mbfTaa5hSV', {
    //permite acesso a todas infos do produto
    expand: ['product']
  })

  const product = {
    priceId: price.id,
    amount: new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(price.unit_amount / 100),
    name: 'publications'
  }

  return {
    props: {
      product,
    },
    /*revalidate = quanto tempo em s quero que a pagina se mantenha 
    sem ser revalidada (reconstruida), gera um novo HTML para salvar no Next*/
    revalidate: 60 * 60 * 24 //60s(1m) 60m(1h) 24 => 24h | 1 dia
  }
}