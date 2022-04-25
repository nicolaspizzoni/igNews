//renderiza a cada troca de pagina
import '../styles/global.scss'

import { SessionProvider as NextSessionProvider } from 'next-auth/react'

import { AppProps } from 'next/app'
import { Header } from '../components/Header'

function MyApp({ Component, pageProps }:AppProps) {
  return (
    <NextSessionProvider session={pageProps.session}>
      <Header />
      {/* Componente é a pagina que o usuário esta */}
      <Component {...pageProps} />
    </NextSessionProvider>
  )
}

export default MyApp
