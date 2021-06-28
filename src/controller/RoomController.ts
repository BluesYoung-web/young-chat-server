/*
 * @Author: zhangyang
 * @Date: 2021-06-28 16:07:43
 * @LastEditTime: 2021-06-28 17:19:19
 * @Description: 处理聊天室相关的操作
 */
import { ChatRoom } from '../entity/ChatRoom';
import { User } from '../entity/User';

import { pushFormat } from './BaseController';
import conf from '../../conf';
import { MySocket } from '../model/socket';
import { RoomMsg, MsgType } from './../@types/room-msg';
import { getRepository } from 'typeorm';

export class RoomController {
  /**
   * 根据两个人的 uid 获取其私有聊天室
   */
  static async getRoomByUids(args: { fid: number }, _uid: number, ctx: MySocket) {
    const { fid = 0 } = args;
    const roomRepo = getRepository(ChatRoom);
    const room = await roomRepo.find({
      where: { owner: 0 },
      relations: ['users']
    });
    const r1_room = room.filter((r) => r.users.length === 2);
    return r1_room.find((r) => {
      const users = r.users.map((user) => user.uid);
      if (users.includes(+_uid) && users.includes(+fid)) {
        return r;
      }
    })
  }
  /**
   * 根据 room.autoid 获取聊天室相关数据
   */
  static async getUsersByAutoid(autoid = 0) {
    const roomRepo = getRepository(ChatRoom);
    const roomData = await roomRepo.findOne({
      where: { autoid },
      relations: ['users', 'users.metadata']
    });
    return roomData;
  }
  /**
   * 创建群聊
   */
  static async createChatRoom(args: { uids: number[] }, _uid: number, ctx: MySocket) {
    
  }
  /**
   * 发消息
   */
  static async sendMsg(args: any, _uid: number, ctx: MySocket) {
    const {
      autoid = 0,
      msg_type = 1,
      content = '',
      extra = {}
    } = args;
    const room = await RoomController.getUsersByAutoid(autoid);
    const users = room?.users?.map((user) => user.uid).filter((uid) => +uid !== +_uid) ?? [];

    let msg: RoomMsg;
    if (room?.owner === 0) {
      const [user_1, user_2] = room.users;
      msg = {
        autoid,
        owner: room?.owner ?? 0,
        msg_type,
        content,
        send_time: Date.now(),
        send_id: _uid,
        extra: {
          [user_1.uid]: user_2,
          [user_2.uid]: user_1
        }
      };
    } else {
      msg = {
        autoid,
        owner: room?.owner ?? 0,
        msg_type,
        content,
        send_time: Date.now(),
        send_id: _uid,
        extra: {
          ...extra,
          name: room?.name ?? `群聊${autoid}`,
          cover: room?.cover
        }
      };
    }
    
    ctx.pushMsg(users, pushFormat(conf.Structor.推送聊天室消息, msg));
    return pushFormat(conf.Structor.推送聊天室消息, msg);
  }
}