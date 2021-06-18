/*
 * @Author: zhangyang
 * @Date: 2021-04-08 17:49:14
 * @LastEditTime: 2021-06-18 15:34:55
 * @Description: 配置文件
 */
import { resolve } from 'path';

enum Structor {
  '签名过期' = '100-0-0',
  '异地登录' = '100-0-1',

  '获取当前用户信息' = '200-0-0',
  '修改当前用户信息' = '200-0-1',

  '无对应的服务' = '500-0-0'
}

const conf = (() => {
  const env = process.env.APP_ENV;
  // 部署配置 --- 树莓派
  const base = {
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
  };
  if (env) {
    // 开发配置 --- 本机
    base.CONF_ORM.host = 'localhost';
    base.CONF_ORM.password = 'root';
    base.CONF_REDIS.host = 'localhost';
  }
  return base;
})();
export default conf;