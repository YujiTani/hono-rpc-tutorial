import { serveStatic } from 'hono/bun'
import { zValidator } from '@hono/zod-validator'
import { createRoute, OpenAPIHono, z } from '@hono/zod-openapi'

const app = new OpenAPIHono()

app.use('/static/*', serveStatic({ root: './' }))
app.use('/favicon.ico', serveStatic({ path: './favicon.ico' }))
app.get('/', (c) => c.text('You can access: /static/hello.txt'))
app.get('*', serveStatic({ path: './static/fallback.txt' }))

// 動作確認用のデータ
const users = [
  { id: '1', name: 'John', age: 20 },
  { id: '2', name: 'Jane', age: 21 },
]

// パラメータの型定義
const reqIdSchema = z.object({
  id: z
  .string()
  .openapi({
    param: {
      name: 'id',
      description: 'ユーザーのID',
      in: 'path',
    },
    example: '999999',
  }),
}).openapi('reqIdSchema')

// ユーザーを作成するための型定義
const reqUserCreateSchema = z.object({
  name: z
  .string()
  .openapi({
    description: 'ユーザーの名前',
    example: 'tarou',
  }),
  age: z
  .number()
  .openapi({
    description: 'ユーザーの年齢',
    example: 20,
  }),
}).openapi('reqUserCreateSchema')

/**
 * ユーザーを取得
 * @param id ユーザーのID
 * @returns ユーザーの情報
 */
app
.openapi(
  createRoute({
    method: 'get',
    path: '/api/users/:id',
    request: {
      params: reqIdSchema,
    },
    responses: {
      200: {
        content: {
          'application/json': {
            schema: z.object({
              id: z.string(),
              name: z.string(),
              age: z.number(),
            }),
          },
        },
        description: 'ユーザーの情報',
      },
    },
  }),
  async (c) => {
    console.log('c', c)
    
    const { id } = c.req.valid("param");
    const user = users.find((user) => user.id === id)
    
    // if (!user) {
    //   return c.json(
    //     {
    //       error: 'not found'
    //     },
    //     404
    //   )
    // }
    
    return c.json(user, 200)
  },
  zValidator('param', reqIdSchema),
)

/**
 * ユーザーを作成
 * @param name ユーザーの名前
 * @param age ユーザーの年齢
 * @returns 作成したユーザーの情報
 */
.post('/api/users',
  zValidator('json', reqUserCreateSchema),
  (c) => {
  const { name, age } = c.req.valid('json')

  users.push({ id: String(users.length + 1), name, age })
  const newUser = users[users.length - 1]

  return c.json(newUser, 201)
})

// routesの型を取り、exportしておく 
export type AppType = typeof app

export default app
