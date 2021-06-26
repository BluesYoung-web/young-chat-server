/*
 * @Author: zhangyang
 * @Date: 2021-06-26 11:23:42
 * @LastEditTime: 2021-06-26 12:05:02
 * @Description: 好友申请表
 */
import { ManyToOne, Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from 'typeorm';
import { User } from './User';

@Entity()
export class FriendApply {
  @PrimaryGeneratedColumn()
  autoid: number;

  @ManyToOne(() => User, user => user.adds)
  from: User;

  @ManyToOne(() => User, user => user.applys)
  to: User;

  @CreateDateColumn()
  time: string;

  @Column({ default: '' })
  msg: string;

  /**
   * 申请状态 0-待处理 1-已同意 2-已拒绝
   */
  @Column({ type: 'tinyint', default: 0 })
  state: 0 | 1 | 2;
}