/*
 * @Author: zhangyang
 * @Date: 2021-04-14 10:39:07
 * @LastEditTime: 2021-06-23 16:56:40
 * @Description: 用户相关的元数据
 */
import { Entity, Column, OneToMany, OneToOne, PrimaryGeneratedColumn } from 'typeorm';
import { Circle } from './Circles';
import { Comments } from './Comments';
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

  @OneToMany(() => Circle, circle => circle.user)
  circles: Circle[];

  @OneToMany(() => Likes, like => like.user)
  likes: Likes[];

  @OneToMany(() => Comments, comment => comment.user)
  comments: Comments[];
}