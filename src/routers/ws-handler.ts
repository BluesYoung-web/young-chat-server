/*
 * @Author: zhangyang
 * @Date: 2021-06-17 17:31:06
 * @LastEditTime: 2021-06-18 16:44:14
 * @Description: websocket 消息及其对应的处理函数
 */
import conf from "../../conf";

const map = new Map<string, { Controller: string, handler: string }>();

map.set(conf.Structor.修改当前用户信息, { Controller: 'UserController', handler: 'setUserInfo' });

export default (com: number, task: number, id:number) => {
  console.log(`${com}-${task}-${id}`);
  
  return map.get(`${com}-${task}-${id}`) || { Controller: 'ErrorController', handler: 'error' };
};