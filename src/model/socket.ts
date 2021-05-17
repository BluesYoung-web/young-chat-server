/*
 * @Author: zhangyang
 * @Date: 2021-04-09 14:10:41
 * @LastEditTime: 2021-05-17 17:33:53
 * @Description: 管理 Websocket 消息
 */

import { createWriteStream } from "fs";
import { PassThrough } from "stream";
import WebSocket from "ws";
import { UserController } from './../controller/UserController';

export class MySocket {
  private uid: string;
  private conn: WebSocket;

  private socketPool: Map<string, WebSocket>;

  private user_controller: UserController;

  private fileName: string;
  private fileType: 'img' | 'audio';
  constructor(uid: string, conn: WebSocket, pool: Map<string, WebSocket>) {
    this.uid = uid;
    this.conn = conn;
    this.socketPool = pool;

    this.init();
  }

  init() {
    this.user_controller = new UserController(this.uid, this.conn);
    this.user_controller.getUserInfo();
  }

  getOnlines() {
    console.log([...this.socketPool.keys()]);
    
  }

  msgProcess(str: any) {
    console.log('---消息处理---');
    if (Buffer.isBuffer(str)) {
      const file = createWriteStream(__dirname + `../../../public/${this.fileType}/${this.fileName}`);
      const buff = new PassThrough();
      buff.end(str);
      buff.pipe(file);
    } else {
      const { com, task, extra } = str;
      if (com === 999) {
        const { fileName } = extra;
        this.fileName = fileName;
        if (task === 1) {
          this.fileType = 'img';
        } else if (task === 2) {
          this.fileType = 'audio';
        }
      }
    }
  }

  offLineSend() {
    console.log('清空离线消息队列');
  }
}