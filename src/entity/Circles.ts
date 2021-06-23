/*
 * @Author: zhangyang
 * @Date: 2021-04-09 17:39:41
 * @LastEditTime: 2021-06-23 12:23:23
 * @Description: 朋友圈表
 */
import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn, OneToMany } from "typeorm";
import { Likes } from "./Likes";
import { Comments } from './Comments';
import { UserMetaData } from "./UserMetadata";

@Entity()
export class Circle {
  @PrimaryGeneratedColumn()
  autoid: number;

  @Column()
  url: string;

  @ManyToOne(() => UserMetaData, meta => meta.circles)
  user: UserMetaData;

  @CreateDateColumn()
  time: string;

  @Column('simple-json')
  imgs: string;

  @OneToMany(() => Likes, like => like.circle)
  likes: Likes[];

  @OneToMany(() => Comments, com => com.circle)
  comments: Comments[];
}