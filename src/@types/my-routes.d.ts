/*
 * @Author: zhangyang
 * @Date: 2021-04-08 10:51:16
 * @LastEditTime: 2021-04-08 11:42:30
 * @Description: 
 */
type HttpMethod = 'get' | 'post' | 'head' | 'put' | 'delete' | 'options' | 'patch';
export interface Young_Route_Item {
  method: HttpMethod;
  path: string | RegExp;
  controller: any;
  action: string;
  com?: number;
  task?: number;
}