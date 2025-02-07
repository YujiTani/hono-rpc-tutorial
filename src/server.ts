import { serveStatic } from 'hono/bun'
import { createRoute, OpenAPIHono, z } from '@hono/zod-openapi'
import { swaggerUI } from "@hono/swagger-ui";

const app = new OpenAPIHono()

// 静的ファイルを提供
app.use('/static/*', serveStatic({ root: './' }))
app.use('/favicon.ico', serveStatic({ path: './static/favicon.ico' }))
app.get('/', (c) => c.text('You can access: /static/hello.txt'))
app.get('*', serveStatic({ path: './static/fallback.txt' }))

// 動作確認用のデータ
const users = [
  { id: '1', name: 'John', age: 20 },
  { id: '2', name: 'Jane', age: 21 },
]


// スキーマを定義

/**
 * ユーザーのIDを取得するためのリクエストパラメータ
 */
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

/**
 * ユーザーを作成するためのリクエストボディ
 */
const reqUserCreateSchema = z.object({
  name: z
  .string().min(1)
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
}).required().openapi('reqUserCreateSchema')

/**
 * ユーザーの情報を返すためのレスポンス型
 */
const resUserSchema = z.object({
  id: z.string(),
  name: z.string(),
  age: z.number(),
}).openapi('resUserSchema')

/**
 * エラーのレスポンス型
 */
const resErrorSchema = z.object({
  error: z.string(),
}).openapi('resErrorSchema')

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
            schema: resUserSchema,
          },
        },
        description: 'ユーザーの情報',
      },
      400: {
        description: 'バリデーションエラー',
        content: {
          'application/json': {
            schema: resErrorSchema,
          },
        },
      },
      404: {
        description: 'ユーザーが見つかりません',
        content: {
          'application/json': {
            schema: resErrorSchema,
          },
        },
      },
    },
  }),
  async (c) => {
    // バリデーションを通ったパラメータを取得
    const { id } = c.req.valid("param");
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
  },
  (result, c) => {
    console.log('result', result)

    if (!result.success) {
      return c.json(
        {
          error: result.error.message,
        },
        400
      );
    }
  }
)

/**
 * ユーザーを作成
 * @param name ユーザーの名前
 * @param age ユーザーの年齢
 * @returns 作成したユーザーの情報
 */
.openapi(
  createRoute({
    method: 'post',
    path: '/api/users',
    request: {
      body: {
        content: {
          'application/json': {
            schema: reqUserCreateSchema,
          },
        },
      },
    },
    responses: {
      201: {
        content: {
          'application/json': {
            schema: resUserSchema,
          },
        },
        description: 'ユーザーを作成しました',
      },
      400: {
        description: 'バリデーションエラー',
        content: {
          'application/json': {
            schema: resErrorSchema,
          },
        },
      },
    },
  }),
  async (c) => {
    const { name, age } = c.req.valid('json')

    users.push({ id: String(users.length + 1), name, age })
    const newUser = users[users.length - 1]

    return c.json(newUser, 201)
  },
  (result, c) => {
    console.log('result', result)

    if (!result.success) {
      return c.json(
        {
          error: result.error.message,
        },
        400
      );
    }
  }
)

// routesの型を取り、exportしておく 
export type AppType = typeof app

// ドキュメントを生成
app.doc31("/doc", {
  openapi: "3.1.0",
  info: {
    version: "1.0.0",
    title: "My Hono API",
  },
});

// ドキュメントを表示
app.get("/ui", swaggerUI({ url: "/doc" }));

export default app
