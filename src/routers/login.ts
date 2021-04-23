/*
 * @Author: zhangyang
 * @Date: 2021-04-08 09:51:39
 * @LastEditTime: 2021-04-08 17:07:37
 * @Description: 登录路由
 */
import { Young_Route_Item } from '../@types/my-routes';
import { LoginController } from './../controller/LoginController';


export const prefix = '/login';

export const router: Young_Route_Item[] = [
  { method: 'get', path: '/', controller: LoginController, action: 'notApply' },
  { method: 'post', path: '/', controller: LoginController, action: 'post' },
  { method: 'get', path: '/getCaptcha', controller: LoginController, action: 'getCaptcha' }
];