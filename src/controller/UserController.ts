/*
 * @Author: zhangyang
 * @Date: 2021-04-08 11:02:48
 * @LastEditTime: 2021-06-21 11:52:44
 * @Description: 用户信息相关
 */
import { getRepository } from 'typeorm';
import { User } from '../entity/User';
import { pushFormat } from './BaseController';
import conf from '../../conf';

interface UserInfo {
  avatar: string;
  nick: string;
  motto: string;
  tel: string;
};

export class UserController {
  static async getUserInfo(uid: number) {
    const userRepository = getRepository(User);
    const info = await userRepository.findOne({
      where: { uid },
      select: ['uid', 'tel', 'metadata'],
      relations: ['metadata']
    });
    const temp = {
      uid: info?.uid,
      tel: info?.tel,
      nick: info?.metadata.nick,
      motto: info?.metadata.motto,
      avatar: info?.metadata.avatar,
      wxid: info?.metadata.wxid,
      send: info?.metadata.circles ?? 0,
      like:  0,
      comment: 0
    };
    const res = pushFormat(conf.Structor.操作成功, temp, conf.Structor.获取当前用户信息);
    return res;
  }

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
        wxid: instance.metadata.wxid,
        send: instance.metadata.circles ?? 0,
        like: instance.metadata.likes ?? 0,
        comment: 0 
      }}, conf.Structor.修改当前用户信息);
      return res;
    } else {
      const res = pushFormat(conf.Structor.操作失败, { msg: '用户信息修改失败' });
      return res;
    }
  }
}