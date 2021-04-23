/*
 * @Author: zhangyang
 * @Date: 2021-04-08 14:10:59
 * @LastEditTime: 2021-04-14 09:59:48
 * @Description: 
 */
import { Context } from 'koa';
import WebSocket from 'ws';


type RespondType = 'success' | 'fail' | 'unknown error';
export class BaseController {
  protected conn?: WebSocket
  respond(ctx: Context, data: any, type: RespondType) {
    switch (type) {
      case 'success':
        ctx.body = { status: 0, data, msg: '成功' };
        break;
      case 'fail':
        ctx.body = { status: -1, data, msg: '失败' };
        break;
      case 'unknown error':
        ctx.body = { status: 99999, data, msg: '未知错误' };
        break;
      default:
        ctx.body = { status: 99999, data, msg: '未知错误' };
        break;
    }
  }

  push(cbk: string, data: any, extra = null) {
    this?.conn?.send(JSON.stringify({ cbk, data, extra }));
  }
}