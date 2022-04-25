import {NextApiRequest, NextApiResponse} from 'next'

// AUTENTICAÇÂO

// JWT (Storage) - grande maioria usa, possui data de expiração, refresh token
// Next Auth (Social) - sistema simples, login social, sem preocupações de armazenar credenciais de acesso no backend
// Cognito (AWS), Auth0 - authentication as a service (terceiros)

export default (request:NextApiRequest, response:NextApiResponse) => {
    const users = [
        {id: 1, nome: 'Nicolas'},
        {id: 2, nome: 'Henrique'},
        {id: 3, nome: 'Heloísa'},
    ]

    return response.json(users)
}

// Serverless
// Sobe o ambiente isolado apenas no momento da chamada da função da api, matando o ambiente assim que o processo finaliza