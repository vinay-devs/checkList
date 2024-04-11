import { Hono } from 'hono'
import { apiRouter } from './routes';



const app = new Hono<{
  Bindings: {
    DATABASE_URL: string
  }
}>();
app.route('/api', apiRouter)
//get todo, update todo,create todo,delete todo,status,signup,signin
// app.post('/', async (c) => {
//   const ans = await c.req.json()
//   console.log(ans)
//   const prisma = new PrismaClient({
//     datasourceUrl: c.env.DATABASE_URL,
//   }).$extends(withAccelerate())
//   const result = await prisma.user.delete({
//     where: {
//       id: 4
//     }
//   })

//   console.log(result)
//   return c.json("result")
// })
export default app
