/*
 * @Author: zhangyang
 * @Date: 2021-04-09 17:53:24
 * @LastEditTime: 2021-06-26 11:33:53
 * @Description: 评论表
 */
import { Entity, Column, ManyToOne, PrimaryGeneratedColumn, CreateDateColumn } from 'typeorm';
import { Circle } from './Circles';
import { User } from "./User";


@Entity()
export class Comments {
  @PrimaryGeneratedColumn()
  autoid: number;

  @Column({ default: '' })
  content: string;

  @ManyToOne(() => Circle, circle => circle.comments)
  circle: Circle;

  @ManyToOne(() => User, user => user.comments)
  user: User;

  @CreateDateColumn()
  time: string;

  @Column({ default: 0 })
  reply?: number;
}