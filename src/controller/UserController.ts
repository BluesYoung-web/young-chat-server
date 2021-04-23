import { UserMetaData } from './../entity/UserMetadata';
/*
 * @Author: zhangyang
 * @Date: 2021-04-08 11:02:48
 * @LastEditTime: 2021-04-14 13:58:49
 * @Description: 用户信息相关
 */
import { getRepository } from 'typeorm';
import { User } from '../entity/User';
import { BaseController } from './BaseController';
import WebSocket from 'ws';
import conf from '../../conf';


export class UserController extends BaseController {
  private userRepository = getRepository(User);
  private uid: string;

  constructor(uid: string, socket: WebSocket) {
    super();
    this.uid = uid;
    this.conn = socket;
  }
  
  async getUserInfo() {
    const info = await this.userRepository.findOne({
      where: { uid: +this.uid },
      select: ['uid', 'tel', 'metadata'],
      relations: ['metadata']
    });
    const temp = {
      uid: info?.uid,
      tel: info?.tel,
      nick: info?.metadata.nick,
      motto: info?.metadata.motto,
      avatar: info?.metadata.avatar,
      wxid: info?.metadata.wxid
    };
    this.push(conf.Structor.获取当前用户信息, temp);
  }
}