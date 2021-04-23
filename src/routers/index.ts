/*
 * @Author: zhangyang
 * @Date: 2021-04-08 09:51:39
 * @LastEditTime: 2021-04-08 16:44:32
 * @Description: 路由汇总
 */
import KoaRouter from '@koa/router';
import { Context } from 'koa';
import { readdirSync } from 'fs';
import { Young_Route_Item } from './../@types/my-routes.d';
import combineRouters from 'koa-combine-routers';

const router  = new KoaRouter();

router.get('/', async (ctx: Context) => {
  ctx.body = '来了老弟'
});

let allRoutes = [router];

readdirSync(__dirname)
  .filter((f) => f !== 'index.ts')
  .map((f) => require('./' + f))
  ?.forEach(({ prefix = '/', router: youngRoutes } : { prefix: string, router: Young_Route_Item[] }) => {
    const temp_router = new KoaRouter();
    temp_router.prefix(prefix);
    youngRoutes?.forEach(({ method, path, controller: Controller, action }) => {
      // 必须使用异步函数的写法，否则会返回 404
      temp_router[method](path, async (ctx: Context) => {
        await (new Controller())[action](ctx);
      });
    });

    allRoutes.push(temp_router);
  });

export default combineRouters(...allRoutes);