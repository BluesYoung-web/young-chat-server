/*
 * @Author: zhangyang
 * @Date: 2021-04-08 11:02:48
 * @LastEditTime: 2021-06-29 10:24:37
 * @Description: 用户信息相关
 */
import { getConnection, getRepository } from 'typeorm';
import { User } from '../entity/User';
import { Likes } from '../entity/Likes';
import { Comments } from '../entity/Comments';
import { UserMetaData } from '../entity/UserMetadata';
import { ChatRoom } from '../entity/ChatRoom';
import { FriendApply } from '../entity/FriendApply';

import { pushFormat } from './BaseController';
import conf from '../../conf';
import { MySocket } from '../model/socket';
import { RoomMsg, MsgType } from './../@types/room-msg';

import { RoomController } from './RoomController';

interface UserInfo {
  avatar: string;
  nick: string;
  motto: string;
  tel: string;
  uid: number;
  send: number;
  like: number;
  comment: number;
};

export class UserController {
  /**
   * 获取用户详细信息
   * @param uid 
   */
  static async getUserInfo(_: any, uid: number, ctx: MySocket) {
    const userRepository = getRepository(User);

    const user_info = await userRepository.createQueryBuilder('user')
      .leftJoinAndSelect('user.metadata', 'meta')
      .leftJoinAndSelect('user.circles', 'circles')
      .select('user.uid', 'uid')
      .addSelect('user.tel', 'tel')
      .addSelect('meta.nick', 'nick')
      .addSelect('meta.motto', 'motto')
      .addSelect('meta.avatar', 'avatar')
      .addSelect(`COUNT(circles.autoid)`, 'send')
      .groupBy('user.uid')
      .where(`user.uid = ${uid}`)
      .getRawOne();

    const likeRepositiory = getRepository(Likes);
    const like = await likeRepositiory.createQueryBuilder('likes')
      .leftJoinAndSelect('likes.user', 'user')
      .where(`user.uid = ${uid}`)
      .getCount();

    const commentRepositiory = getRepository(Comments);
    const comment = await commentRepositiory.createQueryBuilder('comments')
      .leftJoinAndSelect('comments.user', 'user')
      .where(`user.uid = ${uid}`)
      .getCount();
    
    user_info.like = like;
    user_info.comment = comment;

    let res: string;
    if (user_info) {
      res = pushFormat(conf.Structor.操作成功, user_info, conf.Structor.获取当前用户信息);
    } else {
      res = pushFormat(conf.Structor.操作失败, { msg: '用户不存在' });
    }
    return res;
  }
  /**
   * 修改当前用户的详细信息
   * @param uid 
   */
  static async setUserInfo(args: UserInfo, uid: number) {
    const userRepository = getRepository(User);
    const { avatar, nick, motto, tel } = args;

    const instance = await userRepository.findOne({
      where: { uid },
      select: ['uid', 'tel', 'metadata'],
      relations: ['metadata']
    });
    if (instance?.metadata) {
      avatar && (instance.metadata.avatar = avatar);
      nick && (instance.metadata.nick = nick);
      motto && (instance.metadata.motto = motto);
      tel && (instance.tel = tel);
      await userRepository.save(instance);
      const res = pushFormat(conf.Structor.操作成功, { msg: '用户信息修改成功', data: {
        uid,
        tel,
        nick,
        motto,
        avatar,
        send: instance?.circles ?? 0,
        like: instance?.likes ?? 0,
        comment: instance.comments?.length ?? 0
      }}, conf.Structor.修改当前用户信息);
      return res;
    } else {
      const res = pushFormat(conf.Structor.操作失败, { msg: '用户信息修改失败' });
      return res;
    }
  }
  /**
   * 搜索用户
   * uid | tel | nick
   */
  static async searchUser({ id }: { id: string }, _uid: number) {
    const userRepository = getRepository(User);
    const tp = await userRepository.createQueryBuilder('user')
      .leftJoinAndSelect('user.metadata', 'meta')
      .where(`user.uid = ${+id || 0}`)
      .orWhere(`user.tel = '${id}'`)
      .orWhere(`meta.nick LIKE '%${id}%'`)
      .select('user.uid', 'uid')
      .addSelect('meta.nick', 'nick')
      .addSelect('meta.motto', 'motto')
      .addSelect('meta.avatar', 'avatar')
      // .printSql()
      .getRawMany();
    let friends = await UserController.getFriends(_uid);
    friends = friends.map((f: UserInfo) => f.uid);
    for (const item of tp) {
      if (friends.includes(item.uid)) {
        item.is_friend = true;
      } else {
        item.is_friend = false;
      }
    }
    const res = pushFormat(conf.Structor.查找用户, tp);
    return res;
  }
  /**
   * 获取用户的好友列表(纯 fid)
   */
  static async getFriends(uid: number) {
    const userRepository = getRepository(User);
    const friends = await userRepository.createQueryBuilder('user')
      .innerJoinAndSelect('user.f_id', 'friend')
      .innerJoinAndSelect('friend.metadata', 'meta')
      .select('friend.uid', 'uid')
      .addSelect('meta.avatar', 'avatar')
      .addSelect('meta.nick', 'nick')
      .addSelect('meta.motto', 'motto')
      .where(`user.uid = ${uid}`)
      .printSql()
      .getRawMany();
    friends.forEach((item) => item.is_friend = true);
    return friends;
  }
  /**
   * 获取用户好友列表(带在线状态)
   */
   static async getFriendList(_: any, _uid: number, ctx: MySocket) {
    const friends = await UserController.getFriends(_uid);
    const onlines = ctx.getOnlines().map((item) => +item);
    for (const item of friends) {
      if (onlines.includes(item.uid)) {
        item.is_online = true;
      } else {
        item.is_online = false;
      }
    }
    const res = pushFormat(conf.Structor.获取用户好友列表, friends);
    return res;
  }

  /**
   * 发送好友申请
   */
  static async sendFriendApply(args: any, _uid: number, ctx: MySocket) {
    const { to, msg } = args;

    // 获取连接
    const connection = getConnection();
    // 创建新的 queryrunner 
    const queryRunner = connection.createQueryRunner();
    // 建立新的数据库连接
    await queryRunner.connect();

    // 开始事务
    await queryRunner.startTransaction();

    try {
      await queryRunner.manager.createQueryBuilder()
        .insert()
        .into(FriendApply)
        .values({
          from: () => '' + _uid,
          to,
          msg
        })
        .execute();
      await queryRunner.commitTransaction();
      await queryRunner.release();
      ctx.pushMsg([to], pushFormat(conf.Structor.操作成功, {}, conf.Structor.推送好友申请));
      return pushFormat(conf.Structor.操作成功, { msg: '已发送好友申请！' });
    } catch (error) {
      console.log(error);

      await queryRunner.rollbackTransaction();
      await queryRunner.release()

      return pushFormat(conf.Structor.操作失败, { msg: '好友申请发送失败' });
    }
  }

  /**
   * 获取好友申请列表
   */
  static async getFriendApplyList(args: any, _uid: number, ctx: MySocket) {
    const applyRepo = getRepository(FriendApply);

    const from = await applyRepo.createQueryBuilder('apply')
      .select('apply.autoid', 'autoid')
      .addSelect('apply.time', 'time')
      .addSelect('apply.msg', 'msg')
      .addSelect('apply.state', 'state')
      .addSelect('apply.from', 'from')
      .addSelect('apply.to', 'to')
      .where(`apply.from = ${_uid}`)
      .orderBy('apply.time', 'DESC')
      .getRawMany();
    const to = await applyRepo.createQueryBuilder('apply')
      .select('apply.autoid', 'autoid')
      .addSelect('apply.time', 'time')
      .addSelect('apply.msg', 'msg')
      .addSelect('apply.state', 'state')
      .addSelect('apply.from', 'from')
      .addSelect('apply.to', 'to')
      .where(`apply.to = ${_uid}`)
      .orderBy('apply.state', 'ASC')
      .addOrderBy('apply.time', 'DESC')
      .getRawMany();
    
    const metaRepo = getRepository(UserMetaData);
    for (const item of from) {
      const user = await metaRepo.createQueryBuilder('meta')
        .select('meta.nick', 'to_nick')
        .addSelect('meta.avatar', 'to_avatar')
        .where(`meta.autoid = ${item.to}`)
        .getRawOne();
      item.to_nick = user.to_nick;
      item.to_avatar = user.to_avatar;
    }

    for (const item of to) {
      const user = await metaRepo.createQueryBuilder('meta')
        .select('meta.nick', 'from_nick')
        .addSelect('meta.avatar', 'from_avatar')
        .where(`meta.autoid = ${item.from}`)
        .getRawOne();
      item.from_nick = user.from_nick;
      item.from_avatar = user.from_avatar;
    }
    
    return pushFormat(conf.Structor.获取好友申请列表, { from, to });
  }

  /**
   * 处理好友申请
   */
  static async operateFriendApply(args: any, _uid: number, ctx: MySocket) {
    const { autoid = 0, from = 0, is_agree = false } = args;
    const userRepo = getRepository(User);
    // 获取连接
    const connection = getConnection();
    // 创建新的 queryrunner 
    const queryRunner = connection.createQueryRunner();
    // 建立新的数据库连接
    await queryRunner.connect();

    // 开始事务
    await queryRunner.startTransaction();

    try {
      if (is_agree) {
        // 同意，同意 from 相同的全部待处理的
        await queryRunner.manager.createQueryBuilder()
          .update(FriendApply)
          .set({ state: 1 })
          .where(`from = ${from}`)
          .andWhere(`to = ${_uid}`)
          .andWhere(`state = 0`)
          .execute();
        // 加好友，双向存储
        const user_1 = await userRepo.findOne({ where: { uid: from }, relations: ['metadata'] });
        const user_2 = await userRepo.findOne({ where: { uid: _uid }, relations: ['metadata'] });
        if (user_1 && user_2) {
          if (user_1.f_id instanceof Array) {
            user_1.f_id.push(user_2);
          } else {
            user_1.f_id = [user_2];
          }
          if (user_2.f_id instanceof Array) {
            user_2.f_id.push(user_1);
          } else {
            user_2.f_id = [user_1];
          }
          userRepo.save(user_1);
          userRepo.save(user_2);
          // 创建一对一聊天室
          const room = new ChatRoom();
          room.users = [user_1, user_2];
          const s_room = await queryRunner.manager.save(room);
          const msg: RoomMsg = {
            autoid: s_room.autoid,
            owner: s_room.owner,
            msg_type: MsgType.系统消息,
            content: '你们已经是好友了，打个招呼吧！',
            send_time: Date.now(),
            extra: {
              [_uid]: user_1.metadata,
              [from]: user_2.metadata
            }
          };
          ctx.pushMsg([_uid, from], pushFormat(conf.Structor.推送聊天室消息, msg));
        }
      } else {
        // 拒绝，拒绝某一个
        await queryRunner.manager.createQueryBuilder()
          .update(FriendApply)
          .set({ state: 2 })
          .where(`autoid = ${autoid}`)
          .execute();
      }
      await queryRunner.commitTransaction();
      await queryRunner.release();
      return pushFormat(conf.Structor.操作成功, { msg: '处理成功' });
    } catch (error) {
      console.log(error);
      await queryRunner.rollbackTransaction();
      await queryRunner.release();
      return pushFormat(conf.Structor.操作失败, { msg: '处理失败' });
    }
  }

  /**
   * 删好友
   */
  static async delFriend(args: any, _uid: number, ctx: MySocket) {
    const { fid = 0 } = args;
    const userRepo = getRepository(User);
    const roomRepo = getRepository(ChatRoom);
    // 获取连接
    const connection = getConnection();
    // 创建新的 queryrunner 
    const queryRunner = connection.createQueryRunner();
    // 建立新的数据库连接
    await queryRunner.connect();

    // 开始事务
    await queryRunner.startTransaction();
    try {
      const user_1 = await userRepo.findOne({ where: { uid: fid }, relations: ['f_id'] });
      const user_2 = await userRepo.findOne({ where: { uid: _uid }, relations: ['f_id'] });
      if (user_1 && user_1.f_id.length > 0) {
        user_1.f_id = user_1.f_id.filter((item) => item.uid !== user_2?.uid);
      }
      if (user_2 && user_2.f_id.length) {
        user_2.f_id = user_2.f_id.filter((item) => item.uid !== user_1?.uid);
      }
      // 双向删除
      await queryRunner.manager.save(user_1);
      await queryRunner.manager.save(user_2);
      // 删除私聊的聊天室
      const room = await RoomController.getRoomByUids({ fid }, _uid, ctx);
      if (room) {
        await queryRunner.manager.remove(room);
      }
      await queryRunner.commitTransaction();
      await queryRunner.release();
      return pushFormat(conf.Structor.操作成功, { msg: '删除成功' });
    } catch (error) {
      console.log(error);
      await queryRunner.rollbackTransaction();
      await queryRunner.release();
      return pushFormat(conf.Structor.操作失败, { msg: '删除失败' });
    }

  }
}