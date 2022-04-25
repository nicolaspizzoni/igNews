import { GetStaticPaths, GetStaticProps } from "next";
import { useSession } from "next-auth/react";
import Head from "next/head";
import Link from "next/link";
import { useRouter } from "next/router";
import { RichText } from "prismic-dom";
import { useEffect } from "react";
import { getPrismicClient } from "../../../services/prismic";
import styles from '../post.module.scss'

interface PostPreviewProps {
    post: {
        slug: string;
        title: string;
        content: string;
        updatedAt: string;
    }
} 

export default function PostPreview({post}:PostPreviewProps){
    const {data:session} = useSession()
    const router = useRouter()


    useEffect(() => {
        if(session?.activeSubscription){
            router.push(`/posts/${post.slug}`)
        }
    }, [session] )

    return(
        <>
            <Head>
                <title>{post.title} | Ignews</title>
            </Head>
            <main
                className={styles.container}
            >
                <article
                    className={styles.post}
                >
                    <h1>{post.title}</h1>
                    <time>{post.updatedAt}</time>
                    <div
                        dangerouslySetInnerHTML={{__html: post.content}}
                        className={`${styles.postContent} ${styles.previewContent}`}
                    >
                        
                    </div>
                    <div className={styles.continueReading}>
                        Quer continuar lendo?
                        <Link href="/">
                            <a href="">Se inscreva 🤗</a>
                        </Link>
                    </div>
                </article>
            </main>
        </>
    )
}

//No next, especificamente em SSG (Static Site Generation) existem 3 formas de gerar paginas estáticas
// Gerar durante a build (Se houver muitas paginas/conteudo fica pesado);
// Gerar nos primeiros acessos (mais leve porém conteudo é montado somente ao acessar);
// Ambos os metodos (Ex: de 100 paginas gerar 30 com o primeiro metodo e 70 com o segundo);

export const getStaticPaths : GetStaticPaths = () => {
    return {
        //paths determina quais paginas quero gerar na build (1 metodo)
        paths: [
            {params: {slug: 'do-back-ao-mobile-de-onde-surgiu-a-programacao-fullstack'}}
        ],
        fallback: 'blocking'
        //true, false, 'blocking'

        // true => NÂO USADO, post que ainda não foi gerado de forma estatica, ele é renderizado por client side (requisição pelo lado do browser)
        // Causa layout shift (layout pode vir quebrado), não é bom para mecanismo de pesquisa pois conteudo pode nao estar disponivel

        //false => se não foi gerado de forma estática ainda, retorna erro 404

        // 'blocking' parecido com o true mas se o usuário acessar e ainda não ter gerado por meios estáticos, ele tenta carregar porém pela camada do Next
        // usando server side rendering mostrando o conteúdo apenas quando estiver carregado tudo
    }
}

export const getStaticProps: GetStaticProps = async ({params}) => {
    const {slug} = params

    const prismic = getPrismicClient()
    const response = await prismic.getByUID('post', String(slug), {})

    return {
        props: {
            post: {
                slug,
                title: RichText.asText(response.data.title),
                content: RichText.asHtml(response.data.content.slice(0, 3)),
                updatedAt: new Date(response.last_publication_date).toLocaleDateString('pt-BR', {
                    day: "2-digit",
                    month: "long",
                    year: "numeric"
                })
            }
        },
        revalidate: 60 * 60 //1hr
    }
}