/*
 * @Author: zhangyang
 * @Date: 2021-04-09 17:53:24
 * @LastEditTime: 2021-06-23 12:20:48
 * @Description: 评论表
 */
import { Entity, Column, ManyToOne, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { Circle } from './Circles';
import { UserMetaData } from "./UserMetadata";


@Entity()
export class Comments {
  @PrimaryGeneratedColumn()
  autoid: number;

  @Column()
  content: string;

  @ManyToOne(() => Circle, circle => circle.likes)
  circle: Circle;

  @OneToMany(() => UserMetaData, meta => meta.comments)
  user: UserMetaData;
}