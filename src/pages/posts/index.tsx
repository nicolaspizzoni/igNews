import { GetStaticProps } from 'next';
import Head from 'next/head';
import { getPrismicClient } from '../../services/prismic';
import styles from './styles.module.scss';
import Prismic from '@prismicio/client'
import {RichText} from 'prismic-dom'
import Link from 'next/link';

type Post = {
    slug: string;
    title: string;
    excerpt: string;
    updatedAt: string
}

interface PostsProps {
    posts: Post[]
}

export default function Posts({posts}:PostsProps){
    return(
        <>
            <Head>
                <title>Posts | Ignews</title>
            </Head>
            <main className={styles.container}>
                <div className={styles.posts}>
                    {posts.map(post => (
                        <Link href={`/posts/${post.slug}`}>
                            <a key={post.slug}>
                                <time>{post.updatedAt}</time>
                                <strong>{post.title}</strong>
                                <p>{post.excerpt}</p>
                            </a>
                        </Link>
                    ))}
                </div>
            </main>
        </>
    )
}

//Fazer formatação de dados (data, preço, texto) dentro do getStaticProps para que a formatação ocorra uma única vez

export const getStaticProps : GetStaticProps = async() => {
    const prismic = getPrismicClient()

    const response = await prismic.getAllByType('post', {
        fetch: ['post.title', 'post.content'],
        pageSize: 100
    })

    // console.log(JSON.stringify(response, null, 2)) Ver response completa com arrays abertos no console

    const posts = response.map(post => {
        return {
            //slug = url do post
            slug: post.uid,
            //RichText serve para pegar o dado no formato desejado mais facilmente
            title: RichText.asText(post.data.title),
            //Verificar se o conteudo do post é paragrafo se houver '?' pegar o text, senão '??' colocar string vazia
            excerpt: post.data.content.find(content => content.type === 'paragraph')?.text ?? '',
            updatedAt: new Date(post.last_publication_date).toLocaleString('pt-BR', {
                day: '2-digit',
                month: 'long',
                year: 'numeric'
            })
        }
    })

    return {
        props: {
            posts
        }
    }
}