/*
 * @Author: zhangyang
 * @Date: 2021-06-28 16:07:43
 * @LastEditTime: 2021-06-30 14:26:57
 * @Description: 处理聊天室相关的操作
 */
import { ChatRoom } from '../entity/ChatRoom';
import { User } from '../entity/User';

import { pushFormat } from './BaseController';
import conf from '../../conf';
import { MySocket } from '../model/socket';
import { RoomMsg, MsgType } from './../@types/room-msg';
import { getRepository, Not } from 'typeorm';

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
  static async createChatRoom(args: { uids: number[], name?: string, cover?: string }, _uid: number, ctx: MySocket) {
    const { uids, name = `群聊${Date.now()}`, cover = '' } = args;
    let res: string;
    if (uids.length === 1) {
      // 获取一对一聊天室的相关信息
      const { autoid = 0 } = await RoomController.getRoomByUids({ fid: uids[0] }, _uid, ctx) || {};
      const room = await RoomController.getUsersByAutoid(autoid);
      const [user_1, user_2] = room?.users ?? [];
      const extra = {
        [user_1.uid]: user_2.metadata,
        [user_2.uid]: user_1.metadata
      };
      res = pushFormat(conf.Structor.创建聊天室, { ...room, extra });
    } else {
      // 创建多人聊天室
      const roomRepo = getRepository(ChatRoom);
      const userRepo = getRepository(User);
      const room = new ChatRoom();
      room.cover = cover;
      room.name = name;
      room.owner = _uid;
      room.users = [];
      for (const uid of [...uids, _uid]) {
        const user = await userRepo.findOne({ where: { uid } });
        user && room.users.push(user);
      }
      const savedRoom = await roomRepo.save(room);
      const msg: RoomMsg = {
        autoid: savedRoom.autoid,
        msg_type: MsgType.系统消息,
        content: '群聊创建成功，快来聊天吧',
        send_time: Date.now(),
        owner: _uid,
        extra: savedRoom
      };
      ctx.pushMsg([...uids, _uid], pushFormat(conf.Structor.推送聊天室消息, msg));
      res = pushFormat(conf.Structor.创建聊天室, savedRoom);
    }
    return res;
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
    const sender = room?.users.find((user) => +user.uid === +_uid);
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
        send_avatar: sender?.metadata?.avatar ?? '',
        send_nick: sender?.metadata?.nick ?? '',
        extra: {
          [user_1.uid]: user_2.metadata,
          [user_2.uid]: user_1.metadata
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
        send_avatar: sender?.metadata?.avatar ?? '',
        send_nick: sender?.metadata?.nick ?? '',
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
  /**
   * 获取群聊列表
   */
  static async getRoomList(args: any, _uid: number, ctx: MySocket) {
    const roomRepo = getRepository(ChatRoom);
    const rooms = await roomRepo.createQueryBuilder('room')
      .leftJoinAndSelect('room.users', 'user')
      .select('room.autoid', 'autoid')
      .addSelect('room.name', 'name')
      .addSelect('room.cover', 'cover')
      .addSelect('room.owner', 'owner')
      .where(`room.owner != 0`)
      .andWhere(`user.uid = ${_uid}`)
      .groupBy('room.autoid')
      .getRawMany();

    const res = pushFormat(conf.Structor.获取我的群聊列表, rooms);
    return res;
  }
}