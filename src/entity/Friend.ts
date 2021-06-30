/*
 * @Author: zhangyang
 * @Date: 2021-06-30 10:52:14
 * @LastEditTime: 2021-06-30 11:21:33
 * @Description: 好友表
 */
import { Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { User } from './User';

@Entity()
export class Friend {
  @PrimaryGeneratedColumn()
  autoid: number;

  @ManyToOne(() => User, user => user.uid)
  uid: User;

  @ManyToOne(() => User, user => user.f_id)
  fid: User;
}