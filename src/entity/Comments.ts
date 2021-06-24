/*
 * @Author: zhangyang
 * @Date: 2021-04-09 17:53:24
 * @LastEditTime: 2021-06-24 19:09:25
 * @Description: 评论表
 */
import { Entity, Column, ManyToOne, PrimaryGeneratedColumn, OneToOne, CreateDateColumn } from 'typeorm';
import { Circle } from './Circles';
import { User } from "./User";


@Entity()
export class Comments {
  @PrimaryGeneratedColumn()
  autoid: number;

  @Column()
  content: string;

  @ManyToOne(() => Circle, circle => circle.comments)
  circle: Circle;

  @ManyToOne(() => User, user => user.comments)
  user: User;

  @CreateDateColumn()
  time: string;

  @Column()
  reply: number;
}