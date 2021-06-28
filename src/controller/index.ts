/*
 * @Author: zhangyang
 * @Date: 2021-06-17 17:49:54
 * @LastEditTime: 2021-06-28 16:48:06
 * @Description: 统一暴露
 */
import { UserController } from './UserController';
import { LoginController } from './LoginController';
import { CircleController } from './CircleController';
import { RoomController } from './RoomController';

import { ErrorController } from './ErrorController';

export default {
  UserController,
  LoginController,
  CircleController,
  RoomController,
  ErrorController
};