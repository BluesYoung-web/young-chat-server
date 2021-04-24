/*
 * @Author: zhangyang
 * @Date: 2021-04-08 17:49:14
 * @LastEditTime: 2021-04-24 19:22:36
 * @Description: 配置文件
 */
import { resolve } from 'path';

enum Structor {
  '签名过期' = '100-0-0',
  '异地登录' = '100-0-1',

  '获取当前用户信息' = '200-0-0'
}

export default {
  CONF_HTTP_PORT: 1443,
  CONF_WS_PORT: 9527,
  CONF_ORM: {
    type: 'mysql',
    host: '172.18.0.4',
    port: 3306,
    username: 'root',
    password: 'my-secret-pw',
    database: 'orm_chat_demo',
    synchronize: true,
    logging: false,
    entities: [resolve(__dirname, 'src/entity/**/*{.ts,.js}')],
    migrations: [resolve(__dirname, 'src/migration/**/*{.ts,.js}')],
    subscribers: [resolve(__dirname, 'src/subscriber/**/*{.ts,.js}')]
 },
 CONF_REDIS: {
  host: '172.18.0.5'
 },
 CONF_TOKEN_KEY: 'bluesyoung-web',
 Structor
}