/*
 * @Author: zhangyang
 * @Date: 2020-09-23 09:11:50
 * @LastEditTime: 2021-04-09 11:34:12
 * @Description: 服务端主程序
 */
import 'reflect-metadata';
import { createConnection } from 'typeorm';
import conf from './conf';


(async () => {
  // 引入数据库配置
  const orm_conf = conf.CONF_ORM;
  // 连接数据库，如果没有表则建表
  // 加入 catch 以防万一！！！
  await createConnection(orm_conf as any).catch((error) => console.log(error));
  // 必须在数据库连接建立成功之后动态导入
  const { createApp, createWebSocket } = await require('./src/server');
  createApp();
  createWebSocket();
})();