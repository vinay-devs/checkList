import { Hono } from "hono";
import { userRouters } from "./user-routes";
import { todoRoutes } from "./todo-routes";

export const apiRouter = new Hono();

apiRouter.route('/user', userRouters)
apiRouter.route('/todo', todoRoutes)