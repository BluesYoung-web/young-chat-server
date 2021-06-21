/*
 * @Author: zhangyang
 * @Date: 2021-04-08 14:10:59
 * @LastEditTime: 2021-06-21 11:31:14
 * @Description: 
 */
import { Context } from 'koa';

type RespondType = 'success' | 'fail' | 'unknown error';
export class BaseController {
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
};

export const pushFormat = (cbk: string, data: any, extra: any = null) => {
  return JSON.stringify({ cbk, data, extra });
};