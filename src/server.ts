import { Hono } from 'hono'
import { serveStatic } from 'hono/bun'
import { z } from 'zod'
import { zValidator } from '@hono/zod-validator'

const app = new Hono()

app.use('/static/*', serveStatic({ root: './' }))
app.use('/favicon.ico', serveStatic({ path: './favicon.ico' }))
app.get('/', (c) => c.text('You can access: /static/hello.txt'))
app.get('*', serveStatic({ path: './static/fallback.txt' }))

const users = [
  { id: '1', name: 'John', age: 20 },
  { id: '2', name: 'Jane', age: 21 },
]

// 受け取りたいデータ型を定義
const idSchema = z.object({
  id: z.string(),
})

const userCreateSchema = z.object({
  name: z.string(),
  age: z.number(),
})

/**
 * ユーザーを取得
 * @param id ユーザーのID
 * @returns ユーザーの情報
 */
app.get('/api/users/:id',
  zValidator('param', idSchema),
  (c) => {
  const { id } = c.req.valid('param')
  
  const user = users.find((user) => user.id === id)

  if (!user) {
    return c.json(
      {
        error: 'not found'
      },
      404
    )
  }

  return c.json(user, 200)
})

/**
 * ユーザーを作成
 * @param name ユーザーの名前
 * @param age ユーザーの年齢
 * @returns 作成したユーザーの情報
 */
app.post('/api/users',
  zValidator('json', userCreateSchema),
  (c) => {
  const { name, age } = c.req.valid('json')
  return c.json({ message: `${name} is ${age} years old` })
})

const routes = app.routes
console.log('routes:', routes)

// routesの型を取り、exportしておく 
export type AppType = typeof routes

export default app
