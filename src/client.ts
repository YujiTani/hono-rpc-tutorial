import type { AppType } from './server'
import { hc } from 'hono/client'

const client = hc<AppType>(`http://localhost:3000/`)
// console.log('url', client.api.users.$url())

// ユーザーを作成
// MEMO: client の型定義方法がわからない
// @ts-ignore
const res = await client.api.users.$post({
    json: {
        name: '',
        age: '20',
    },
})

if (res.ok) {
    const data = await res.json()
    console.log(res.status, data)
}

if (res.status === 400) {
    const data = await res.json()
    console.log(res.status, data)
}

// ユーザーを取得
// @ts-ignore
const res2 = await client.api.users[':id'].$get({
    param: {
        id: '299',
    },
})

if (res2.status === 404) {
    const data = await res2.json()
    console.log(res2.status, data)
}

if (res2.ok) {
    const data = await res2.json()
    console.log(res2.status, data)
}

// ユーザーを取得
// @ts-ignore
const res3 = await client.api.users[':id'].$get({
    param: {
        id: '1',
    },
})

if (res3.status === 404) {
    const data = await res3.json()
    console.log(res3.status, data)
}

if (res3.ok) {
    const data = await res3.json()
    console.log(res3.status, data)
}
