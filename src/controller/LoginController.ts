
/*
 * @Author: zhangyang
 * @Date: 2021-04-08 11:02:48
 * @LastEditTime: 2021-04-14 13:38:05
 * @Description: 处理登录
 */
import { getRepository } from 'typeorm';
import { User } from '../entity/User';
import { Context } from 'koa';
import { BaseController } from './BaseController';
import svgCaptcha from 'svg-captcha';
import conf from '../../conf';
import { UserMetaData } from './../entity/UserMetadata';
import { myredis } from './../database/conn';

/**
 * 制作token的函数
 */
 const makeToken = function(){
  const md5 = require('md5');
  const sha1 = require('sha1');
  const key = conf.CONF_TOKEN_KEY;
  return md5(key + sha1(new Date().getTime()));
}

export class LoginController extends BaseController {
  private userRepository = getRepository(User);

  async notApply(ctx: Context) {
    this.respond(ctx, '请使用 post 登录', 'fail');
  }

  async post(ctx: Context) {
    const md5 = require('md5');
    const { tel, passwd } = ctx.request.body;
    const savePass = md5(passwd);
    const hasUser = await this.userRepository.findOne({ tel });
    const token = makeToken();

    if (hasUser) {
      // 用户存在，校验密码
      if (savePass === hasUser.passwd) {
        await myredis.set(hasUser.uid + '_token', token);
        this.respond(ctx, { token, uid: hasUser.uid }, 'success');
      } else {
        this.respond(ctx, '密码错误', 'fail');
      }
    } else {
      // 用户不存在，注册新用户
      const user = new User();
      user.tel = tel;
      user.passwd = savePass;
      const userMetaData = new UserMetaData();
      user.metadata = userMetaData;
      // save ，存在则更新，不存在则创建
      const res = await this.userRepository.save(user);
      await myredis.set(res.uid + '_token', token);
      this.respond(ctx, { token, uid: res.metadata.autoid }, 'success');
    }
  }

  async getCaptcha(ctx: Context) {
    const cap = svgCaptcha.create({
      size: 4, // 验证码长度
      width: 120,
      height: 40,
      fontSize: 40,
      ignoreChars: '0oO1ilI', // 验证码字符中排除 0o1i
      noise: 2, // 干扰线条的数量
      color: true, // 验证码的字符是否有颜色，默认没有，如果设定了背景，则默认有
      background: '#eee' // 验证码图片背景颜色
    });
    this.respond(ctx, cap, 'success');
  }

}