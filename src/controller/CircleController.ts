/*
 * @Author: zhangyang
 * @Date: 2021-06-24 15:11:59
 * @LastEditTime: 2021-06-25 16:34:10
 * @Description: 动态相关
 */
import { Circle } from '../entity/Circles';
import { User } from '../entity/User';
import { Likes } from '../entity/Likes';
import { Comments } from '../entity/Comments';

import { getRepository, getConnection } from 'typeorm';
import { pushFormat } from './BaseController';
import conf from '../../conf';
import { MySocket } from './../model/socket';
import { UserController } from './UserController';

interface CircleItem {
  url: string;
  content: string;
};

export class CircleController {
  /**
   * 推送新的动态给好友
   */
  static async pushNewCircle(_uid: number, ctx: MySocket) {
    let fids = await UserController.getFriends(_uid);
    fids = fids.map((item) => item.uid);
    const msg = pushFormat(conf.Structor.操作成功, {}, conf.Structor.推送动态通知给好友);
    ctx.pushMsg(fids, msg);
  }
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
    
    try {
      await circleRepository.save(circle);

      const res = pushFormat(conf.Structor.操作成功, { msg: '动态发表成功！' });
      CircleController.pushNewCircle(_uid, ctx);
      return res;
    } catch (error) {
      return pushFormat(conf.Structor.操作失败, { msg: '发表失败！' });
    }
    
  }

  /**
   * 获取动态
   */
  static async getCircle(args: any, _uid: number, ctx: MySocket) {
    const { page = 1, limit = 10 } = args;
    let fids = await UserController.getFriends(_uid);
    fids = fids.map((item) => item.uid);

    const circleRepository = getRepository(Circle);
    const res = await circleRepository.createQueryBuilder('circle')
      .leftJoinAndSelect('circle.user', 'user')
      .leftJoinAndSelect('user.metadata', 'meta')
      .leftJoinAndSelect('circle.likes', 'likes')
      .leftJoinAndSelect('circle.comments', 'comments')
      // .skip((page - 1) * limit)
      // .take(limit)
      .offset((page - 1) * limit)
      .limit(limit)

      .select('circle.autoid', 'autoid')
      .addSelect('circle.url', 'url')
      .addSelect('circle.content', 'content')
      .addSelect('circle.time', 'time')
      .addSelect('user.uid', 'user_id')
      .addSelect('meta.nick', 'user_nick')
      .addSelect('meta.avatar', 'user_avatar')
      .addSelect(`COUNT(likes.autoid)`, 'likes_num')
      .addSelect(`COUNT(comments.autoid)`, 'comments_num')
      .groupBy('circle.autoid')
      .addOrderBy('circle.time', 'DESC')
      .where(`user.uid in (${[_uid, ...fids]})`)
      .getRawMany();

    const userRepository = getRepository(User);
    for (const circle of res) {
      const hasLike = await userRepository.createQueryBuilder('user')
      .leftJoinAndSelect('user.circles', 'circle')
      .leftJoinAndSelect('user.likes', 'likes')
      .select('likes.autoid', 'has_like')
      .where(`likes.user = ${_uid}`)
      .andWhere(`likes.circle = ${circle.autoid}`)
      .getRawMany();
      
      if (hasLike.length > 0) {
        circle.has_like = true;
      } else {
        circle.has_like = false;
      }
    }
    
    return pushFormat(conf.Structor.获取动态, res);
  }

  /**
   * 删除动态
   */
  static async delCircle(args: any, _uid: number, ctx: MySocket) {
    const { autoid } = args;
    // 获取连接
    const connection = getConnection();
    // 创建新的 queryrunner 
    const queryRunner = connection.createQueryRunner();
    // 建立新的数据库连接
    await queryRunner.connect();

    // 开始事务
    await queryRunner.startTransaction();

    try {
      // 删除点赞表中相关的数据
      await queryRunner.manager.createQueryBuilder()
        .from('likes', 'likes')
        .leftJoinAndSelect('likes.circle', 'circle')
        .where(`circle.autoid = ${autoid}`)
        .delete()
        .execute();
      // 删除评论表中相关的数据
      await queryRunner.manager.createQueryBuilder()
        .from('comments', 'comments')
        .leftJoinAndSelect('comments.circle', 'circle')
        .where(`circle.autoid = ${autoid}`)
        .delete()
        .execute();
      // 删除对应的动态
      await queryRunner.manager.createQueryBuilder()
        .from('circle', 'circle')
        .where(`circle.autoid = ${autoid}`)
        .delete()
        .execute();
      // 事务完成，提交
      await queryRunner.commitTransaction();
      // 释放连接
      await queryRunner.release();
      return pushFormat(conf.Structor.操作成功, { msg: '动态删除成功！' }, conf.Structor.删除动态);
    } catch (error) {
      // 事务出错，回滚
      await queryRunner.rollbackTransaction();
      // 释放连接
      await queryRunner.release();
      return pushFormat(conf.Structor.操作失败, { msg: '动态删除失败' }, conf.Structor.删除动态);
    }
  }

  /**
   * 点赞 | 取消点赞
   */
  static async clickLike(args: any, _uid: number, ctx: MySocket) {
    const { autoid, has_like } = args;
    const likeRepositiory = getRepository(Likes);

    const userRepository = getRepository(User);
    const circleRepository = getRepository(Circle);
    if (!has_like) {
      // 点赞
      const like = new Likes();
      const user = await userRepository.findOne({
        where: { uid: _uid }
      });
      const circle = await circleRepository.findOne({
        where: { autoid }
      });

      if (user) {
        like.user = user;
      }
      if (circle) {
        like.circle = circle;
      }
      
      try {
        await likeRepositiory.save(like);
        return pushFormat(conf.Structor.操作成功, {});
      } catch (error) {
        return pushFormat(conf.Structor.操作失败, {});
      }
      
    } else {
      // 取消点赞
      const res = await likeRepositiory.createQueryBuilder()
        .from('likes', 'likes')
        .leftJoinAndSelect('likes.circle', 'circle')
        .leftJoinAndSelect('likes.user', 'user')
        .where(`circle.autoid = ${autoid}`)
        .andWhere(`user.uid = ${_uid}`)
        .delete()
        .execute();
      if (res) {
        return pushFormat(conf.Structor.操作成功, {});
      } else {
        return pushFormat(conf.Structor.操作失败, {});
      }
    }
  }
}