/*
 * @Author: zhangyang
 * @Date: 2021-04-14 10:39:07
 * @LastEditTime: 2021-06-17 17:07:01
 * @Description: 用户相关的元数据
 */
import { Entity, Column, JoinTable, ManyToMany, OneToMany, OneToOne, PrimaryGeneratedColumn, JoinColumn } from 'typeorm';
import { Circle } from './Circles';
import { Likes } from './Likes';
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

  @Column({ default: '' })
  wxid: string;

  @ManyToMany(() => User)
  @JoinTable()
  f_id: User[];

  @OneToMany(() => Circle, circle => circle.user)
  circles: Circle[];

  @OneToMany(() => Likes, like => like.user)
  likes: Likes[];
}