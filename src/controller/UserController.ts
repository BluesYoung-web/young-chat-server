/*
 * @Author: zhangyang
 * @Date: 2021-04-08 11:02:48
 * @LastEditTime: 2021-06-18 15:33:54
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
    console.log(info?.metadata)
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
    const res = pushFormat(conf.Structor.获取当前用户信息, temp);
    return res;
  }

  static async setUserInfo(args: UserInfo) {
    const userRepository = getRepository(User);
    const { avatar, nick, motto, tel } = args;
    console.log(args);
  }
}