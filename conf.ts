/*
 * @Author: zhangyang
 * @Date: 2021-04-08 17:49:14
 * @LastEditTime: 2021-07-02 15:40:50
 * @Description: 配置文件
 */
import { resolve } from 'path';

enum Structor {
  '操作成功' = '0-0-0',
  '操作失败' = '0-0-1',
  
  '签名过期' = '100-0-0',
  '异地登录' = '100-0-1',

  '获取当前用户信息' = '200-0-0',
  '修改当前用户信息' = '200-0-1',
  '查找用户' = '200-0-2',
  '获取用户好友列表' = '200-0-3',
  '发送好友申请' = '200-0-4',
  '获取好友申请列表' = '200-0-5',
  '处理好友申请' = '200-0-6',
  '删好友' = '200-0-7',
  '聊天室内发消息' = '200-0-8',
  '创建聊天室' = '200-0-9',
  '获取我的群聊列表' = '200-0-10',
  '获取聊天室详情' = '200-0-11',
  '修改聊天室信息' = '200-0-12',
  '退出聊天室' = '200-0-13',

  '推送好友申请' = '200-1-0',
  '推送聊天室消息' = '200-1-1',

  '发动态' = '300-0-0',
  '获取动态' = '300-0-1',
  '删除动态' = '300-0-2',
  '点赞' = '300-0-3',
  '获取评论列表' = '300-0-4',
  '发表评论' = '300-0-5',
  '删除评论' = '300-0-6',
  
  '推送动态通知给好友' = '300-1-0',

  '无对应的服务' = '500-0-0',
  '上传图片' = '999-1',
  '上传音频' = '999-2',
  '文件上传成功' = '999-999-999'
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