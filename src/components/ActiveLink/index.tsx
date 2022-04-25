import Link, { LinkProps } from 'next/link'
import { ReactElement, cloneElement } from 'react'
import {useRouter} from 'next/router'


interface ActiveLinkProps extends LinkProps {
    children: ReactElement;
    activeClassName: string;
}

export function ActiveLink({ children, activeClassName, ...rest }:ActiveLinkProps){

    //asPath pega qual diretorio está selecionado ('/', '/posts')
    const {asPath} = useRouter()

    const className = asPath === rest.href ? activeClassName : ''

    // cloneElement permite clonar um elemento e adicionar propriedades a ele
    return(
        <Link {...rest}>
            {cloneElement(children, {
                className
            })}
        </Link>
    )
}