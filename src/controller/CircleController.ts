/*
 * @Author: zhangyang
 * @Date: 2021-06-24 15:11:59
 * @LastEditTime: 2021-06-24 19:12:53
 * @Description: 动态相关
 */
import { Circle } from './../entity/Circles';
import { User } from './../entity/User';

import { getRepository } from 'typeorm';
import { pushFormat } from './BaseController';
import conf from '../../conf';
import { MySocket } from './../model/socket';

interface CircleItem {
  url: string;
  content: string;
};

export class CircleController {
  /**
   * 发动态
   */
  static async sendCircle(args: CircleItem, _uid: number, ctx: MySocket) {
    const { url, content } = args;
    const circleRepository = getRepository(Circle);
    const userRepository = getRepository(User)
    const user = await userRepository.findOne({
      where: { uid: _uid }
    });

    const circle = new Circle();
    circle.content = content;
    circle.url = url;
    if (user) {
      circle.user = user;
    }
    
    await circleRepository.save(circle);

    const tp = await circleRepository.find();
    console.log(tp);
    const res = pushFormat(conf.Structor.操作成功, tp, conf.Structor.发动态);
    return res;
  }

  /**
   * 获取动态
   */
  // static async
}