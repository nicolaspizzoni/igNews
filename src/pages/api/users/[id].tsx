// [parametro] no nome do arquivo [id].tsx

import { NextApiRequest, NextApiResponse } from 'next'

export default (request:NextApiRequest, response:NextApiResponse) => {
    console.log(request.query)
    const users = [
        {id: 1, nome: 'Nicolas'},
        {id: 2, nome: 'João'},
        {id: 3, nome: 'Heloísa'},
    ]

    const userReturn = users.filter(item => item.id == Number(request.query.id))

    return response.json(userReturn)
}