/*
 * @Author: zhangyang
 * @Date: 2021-06-24 15:11:59
 * @LastEditTime: 2021-06-26 11:08:01
 * @Description: 动态相关
 */
import { Circle } from '../entity/Circles';
import { User } from '../entity/User';
import { Likes } from '../entity/Likes';
import { Comments } from '../entity/Comments';
import { UserMetaData } from '../entity/UserMetadata';

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
    const { page = 1, limit = 10, is_my = false, is_like = false, is_comment = false } = args;
    let fids = await UserController.getFriends(_uid);
    fids = fids.map((item) => item.uid);

    const circleRepository = getRepository(Circle);
    let temp = await circleRepository.createQueryBuilder('circle')
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
      // .addSelect(`COUNT(likes.autoid)`, 'likes_num')
      // .addSelect(`COUNT(comments.autoid)`, 'comments_num')
      .groupBy('circle.autoid')
      .addOrderBy('circle.time', 'DESC')
      .where(`user.uid in (${[_uid, ...fids]})`);

    if (is_my) {
      temp = await temp.where(`user.uid = ${_uid}`);
    };
    if (is_like) {
      temp = await temp.andWhere(`likes.user = ${_uid}`);
    }
    if (is_comment) {
      temp = await temp.andWhere(`comments.user = ${_uid}`);
    };

    const res = await temp.getRawMany();

    
    const userRepository = getRepository(User);
    const commentRepositiory = getRepository(Comments);
    const likeRepositiory = getRepository(Likes);
    for (const circle of res) {
      // 获取当前用户的点赞状态
      if (!is_like) {
        const hasLike = await userRepository.createQueryBuilder('user')
        .leftJoinAndSelect('user.circles', 'circle')
        .leftJoinAndSelect('user.likes', 'likes')
        .select('likes.autoid', 'has_like')
        .where(`likes.user = ${_uid}`)
        .andWhere(`likes.circle = ${circle.autoid}`)
        .getCount();
        if (hasLike > 0) {
          circle.has_like = true;
        } else {
          circle.has_like = false;
        }
      } else {
        circle.has_like = true;
      }
      // 统计评论数
      const comments_num = await commentRepositiory.createQueryBuilder('comments')
        .select('comments.autoid', 'autoid')
        .where(`comments.circle = ${circle.autoid}`)
        .getCount();
      circle.comments_num = comments_num;
      // 统计点赞数
      const likes_num = await likeRepositiory.createQueryBuilder('likes')
        .select('likes.autoid', 'autoid')
        .where(`likes.circle = ${circle.autoid}`)
        .getCount();
      circle.likes_num = likes_num;
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

  /**
   * 获取评论列表
   */
  static async getComments(args: any, _uid: number, ctx: MySocket) {
    const { autoid = 0 } = args;
    
    const commentsRepository = getRepository(Comments);
    const metaRepository = getRepository(UserMetaData);

    const res = await commentsRepository.createQueryBuilder('comments')
      .leftJoinAndSelect('comments.circle', 'circle')
      .leftJoinAndSelect('comments.user', 'user')
      .leftJoinAndSelect('user.metadata', 'meta')
      .select('comments.autoid', 'c_id')
      .addSelect('comments.time', 'time')
      .addSelect('comments.content', 'content')
      .addSelect('comments.reply', 'reply_id')
      .addSelect('user.uid', 'user_id')
      .addSelect('meta.nick', 'user_nick')
      .addSelect('meta.avatar', 'user_avatar')
      .where(`circle.autoid = ${autoid}`)
      .orderBy('comments.time', 'DESC')
      .getRawMany();
    
    for (const comment of res) {
      if (comment.reply_id !== 0) {
        const meta = await metaRepository.findOne({ where: { autoid: comment.reply_id } });
        comment.reply_nick = meta?.nick ?? comment.reply_id;
      }
    }
    
    return pushFormat(conf.Structor.获取评论列表, res);
  }

  /**
   * 发表评论
   */
  static async putUpComments(args: any, _uid: number, ctx: MySocket) {
    const { autoid, reply_id, content } = args;
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
        .into(Comments)
        .values({
          content,
          circle: autoid,
          user: () => '' + _uid,
          reply: reply_id
        })
        .execute();
      await queryRunner.commitTransaction();
      await queryRunner.release();

      return pushFormat(conf.Structor.操作成功, { msg: '评论发表成功' });
    } catch (error) {
      console.log(error);

      await queryRunner.rollbackTransaction();
      await queryRunner.release()

      return pushFormat(conf.Structor.操作失败, { msg: '评论发表失败' });
    }
  }

  /**
   * 删除评论
   */
  static async delComments(args: any, _uid: number, ctx: MySocket) {
    const { c_id = 0 } = args;

    // 获取连接
    const connection = getConnection();
    // 创建新的 queryrunner 
    const queryRunner = connection.createQueryRunner();
    // 建立新的数据库连接
    await queryRunner.connect();

    try {
      await queryRunner.manager.createQueryBuilder()
        .from('comments', 'comments')
        .where(`comments.autoid = ${c_id}`)
        .delete()
        .execute();
      return pushFormat(conf.Structor.操作成功, { msg: '评论删除成功！' });
    } catch (error) {
      console.log(error);
      return pushFormat(conf.Structor.操作失败, { msg: '评论删除失败' });
    }
  }
}