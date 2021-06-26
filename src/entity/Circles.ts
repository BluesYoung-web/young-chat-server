/*
 * @Author: zhangyang
 * @Date: 2021-04-09 17:39:41
 * @LastEditTime: 2021-06-26 11:33:40
 * @Description: 朋友圈表
 */
import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn, OneToMany } from "typeorm";
import { Likes } from "./Likes";
import { Comments } from './Comments';
import { User } from "./User";

@Entity()
export class Circle {
  @PrimaryGeneratedColumn()
  autoid: number;

  @Column({ default: '' })
  url: string;

  @Column({ default: '' })
  content: string;

  @ManyToOne(() => User, user => user.circles)
  user: User;

  @CreateDateColumn()
  time: string;

  @OneToMany(() => Likes, like => like.circle)
  likes: Likes[];

  @OneToMany(() => Comments, com => com.circle)
  comments: Comments[];
}