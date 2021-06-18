/*
 * @Author: zhangyang
 * @Date: 2021-04-09 14:10:41
 * @LastEditTime: 2021-06-18 17:50:30
 * @Description: 管理 Websocket 消息
 */

import { createWriteStream } from "fs";
import { PassThrough } from "stream";
import WebSocket from "ws";
import getHandler from '../routers/ws-handler';
import AllController from '../controller';

interface Msg {
  cbk: string;
  data: {
    com: number;
    task: number;
    id: number;
    params?: any;
  };
  extra: any;
};

export class MySocket {
  private uid: string;
  private conn: WebSocket;

  private socketPool: Map<string, WebSocket>;

  private fileName: string;
  private fileType: 'img' | 'audio';
  constructor(uid: string, conn: WebSocket, pool: Map<string, WebSocket>) {
    this.uid = uid;
    this.conn = conn;
    this.socketPool = pool;

    this.init();
  }

  async init() {
    const user_info = await AllController.UserController.getUserInfo(+this.uid);
    this.conn.send(user_info);
  }

  getOnlines() {
    console.log([...this.socketPool.keys()]);
    
  }

  msgProcess(str: Msg | Buffer) {
    console.log('---消息处理---');
    if (Buffer.isBuffer(str)) {
      const file = createWriteStream(__dirname + `../../../public/${this.fileType}/${this.fileName}`);
      const buff = new PassThrough();
      buff.end(str);
      buff.pipe(file);
    } else {
      const { cbk, data: { com, task, id, params }, extra } = str;
      if (com === 999) {
        const { fileName } = extra;
        this.fileName = fileName;
        if (task === 1) {
          this.fileType = 'img';
        } else if (task === 2) {
          this.fileType = 'audio';
        }
      } else {
        const { Controller, handler } = getHandler(com, task, id);
        // @ts-ignore
        AllController[Controller][handler](params);
      }
    }
  }

  offLineSend() {
    console.log('清空离线消息队列');
  }
}