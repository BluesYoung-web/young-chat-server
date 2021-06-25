/*
 * @Author: zhangyang
 * @Date: 2021-04-08 11:02:48
 * @LastEditTime: 2021-06-25 17:50:33
 * @Description: 用户信息相关
 */
import { getRepository } from 'typeorm';
import { User } from '../entity/User';
import { Likes } from '../entity/Likes';
import { Comments } from '../entity/Comments';
import { pushFormat } from './BaseController';
import conf from '../../conf';
import { MySocket } from './../model/socket';

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
      .leftJoinAndSelect('user.f_id', 'friend')
      .leftJoinAndSelect('friend.metadata', 'meta')
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
   static async getFriendList(_: any, uid: number, ctx: MySocket) {
    const friends = await UserController.getFriends(uid);
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
}