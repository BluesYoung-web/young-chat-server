/*
 * @Author: zhangyang
 * @Date: 2021-06-17 17:49:54
 * @LastEditTime: 2021-06-18 16:45:56
 * @Description: 统一暴露
 */
import { UserController } from './UserController';
import { LoginController } from './LoginController';

import { ErrorController } from './ErrorController';

export default {
  UserController,
  LoginController,
  ErrorController
};