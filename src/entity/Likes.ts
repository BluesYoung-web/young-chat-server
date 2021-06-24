/*
 * @Author: zhangyang
 * @Date: 2021-04-09 17:53:03
 * @LastEditTime: 2021-06-24 18:17:20
 * @Description: 点赞表
 */
import { Entity, Column, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { Circle } from './Circles';
import { User } from './User';

@Entity()
export class Likes {
  @PrimaryGeneratedColumn()
  autoid: number;

  @ManyToOne(() => Circle, circle => circle.likes)
  circle: Circle;

  @ManyToOne(() => User, user => user.likes)
  user: User;
}