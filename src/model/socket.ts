/*
 * @Author: zhangyang
 * @Date: 2021-04-09 14:10:41
 * @LastEditTime: 2021-06-29 15:34:12
 * @Description: 管理 Websocket 消息
 */

import { createWriteStream } from "fs";
import { PassThrough } from "stream";
import WebSocket from "ws";
import getHandler from '../routers/ws-handler';
import AllController from '../controller';
import { pushFormat } from "../controller/BaseController";
import conf from "../../conf";
import { myredis } from '../database/conn';

const sleep = async (time: number) => {
	return new Promise((resolve) => {
		setTimeout(resolve, time * 1000);
	});
};

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
    const user_info = await AllController.UserController.getUserInfo({}, +this.uid, this);
    this.conn.send(user_info);
  }


  async msgProcess(str: Msg | Buffer) {
    console.log('---消息处理---');
    if (Buffer.isBuffer(str)) {
      const file = createWriteStream(__dirname + `../../../public/${this.fileType}/${this.fileName}`);
      const buff = new PassThrough();
      buff.end(str);
      buff.pipe(file);
      const res = pushFormat(conf.Structor.文件上传成功, { url: `/${this.fileType}/${this.fileName}`, fileType: this.fileType }, this.fileType === 'img' ? conf.Structor.上传图片 : conf.Structor.上传音频);
      this.conn.send(res);
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
        const res = await AllController[Controller][handler](params, this.uid, this);
        this.conn.send(res);
      }
    }
  }

  async offLineSend(uid: string, conn: WebSocket) {
    console.log('---获取离线消息队列---');
    const msgList = await myredis.get(`offline_msg_list_${uid}`) as string[] ?? [];
    for (const msg of msgList) {
      conn.send(msg);
      // 500ms 发一条消息
      await sleep(0.5);
    }
    await myredis.set(`offline_msg_list_${uid}`, []);
    console.log('---清空离线消息队列---');
  }

  getOnlines() {
    return [...this.socketPool.keys()];
  }

  async pushMsg(uids: number[], msg: string) {
    for (const uid of uids) {
      const conn = this.socketPool.get(uid + '');
      if (conn) {
        // 在线，直接推送
        conn.send(msg);
      } else {
        // 不在线，存入 redis 离线消息队列
        const msgList = await myredis.get(`offline_msg_list_${uid}`) as string[] ?? [];
        msgList.push(msg);
        await myredis.set(`offline_msg_list_${uid}`, msgList);
      }
    }
  }
}