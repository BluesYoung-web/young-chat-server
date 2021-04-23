/*
 * @Author: zhangyang
 * @Date: 2021-04-09 14:10:41
 * @LastEditTime: 2021-04-14 09:48:46
 * @Description: 管理 Websocket 消息
 */

import WebSocket from "ws";
import { UserController } from './../controller/UserController';

export class MySocket {
  private uid: string;
  private conn: WebSocket;

  private socketPool: Map<string, WebSocket>;

  private user_controller: UserController;
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
    console.log('消息处理');
    console.log(str);
    
  }

  offLineSend() {
    console.log('清空离线消息队列');
  }
}