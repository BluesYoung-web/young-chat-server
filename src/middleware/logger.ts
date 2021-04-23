/*
 * @Author: zhangyang
 * @Date: 2020-09-23 09:37:03
 * @LastEditTime: 2021-04-08 15:42:42
 * @Description: 记录日志的中间件
 */
import { appendFileSync, existsSync, mkdirSync, readdirSync, unlinkSync } from 'fs';
import { Context, Next } from 'koa';
import { resolve } from 'path';

const dirInit = (type: 'access' | 'error') => {
  const basePath = resolve(__dirname, '../log');
  const logPath = resolve(basePath, type);
  if (!existsSync(basePath)) {
    mkdirSync(basePath);
  }
  if (!existsSync(logPath)) {
    mkdirSync(logPath);
  }
}


export default () => async (ctx: Context, next: Next) => {
  dirInit('access');

  const startTime = Date.now();
  const requestTime = new Date();

  const logPath = resolve(__dirname, '../log/access/');

  await next();
  const useTime = Date.now() - startTime;
  const logout = `${ctx.request.ip} -- ${requestTime} -- ${ctx.method} -- ${ctx.url} -- ${useTime}ms`;
  const filename = resolve(logPath, requestTime.toLocaleDateString() + '.log');

  
  const Files = readdirSync(logPath);
  for (const file of Files) {
    if (startTime - new Date(file.slice(0, 10)).getTime() > 1000 * 3600 * 24 * 7) {
      // 清除超过一周的日志
      unlinkSync(resolve(logPath, file));
    }
  }
  
  appendFileSync(filename, logout + '\n');
};

/**
 * 错误日志，在可能出错的地方手动调用
 * @param err 
 */
export const error = (err: Error) =>  {
  dirInit('error');

  const requestTime = new Date();
  const errorInfo = `${requestTime.toLocaleTimeString()} -- ${JSON.stringify(err)}`;

  const logPath = resolve(__dirname, '../log/error/');

  if (!existsSync(logPath)) {
    mkdirSync(logPath);
  }

  const filename = resolve(logPath, requestTime.toLocaleDateString() + '.log');

  const Files = readdirSync(logPath);
  for (const file of Files) {
    if (requestTime.getTime() - new Date(file.slice(0, 10)).getTime() > 1000 * 3600 * 24 * 7) {
      // 清除超过一周的日志
      unlinkSync(resolve(logPath, file));
    }
  }
  
  appendFileSync(filename, errorInfo + '\n');
}