/*
 * @Author: zhangyang
 * @Date: 2021-04-14 10:39:07
 * @LastEditTime: 2021-06-24 18:07:46
 * @Description: 用户相关的元数据
 */
import { Entity, Column, OneToOne, PrimaryGeneratedColumn } from 'typeorm';
import { User } from './User';

@Entity()
export class UserMetaData {
  @PrimaryGeneratedColumn()
  autoid: number;

  @OneToOne(() => User, user => user.metadata)
  user: User;
  
  @Column({ default: '' })
  nick: string;

  @Column({ default: '' })
  motto: string;

  @Column({ default: '' })
  avatar: string;
}