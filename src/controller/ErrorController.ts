/*
 * @Author: zhangyang
 * @Date: 2021-06-18 15:31:33
 * @LastEditTime: 2021-06-18 16:46:58
 * @Description: 错误收集
 */
import { pushFormat } from "./BaseController";
import conf from '../../conf';
export class ErrorController {
  static error() {
    return pushFormat(conf.Structor.无对应的服务, { msg: '服务错误' });
  }
}