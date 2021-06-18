/*
 * @Author: zhangyang
 * @Date: 2021-04-09 17:53:03
 * @LastEditTime: 2021-06-17 17:07:11
 * @Description: 点赞表
 */
import { Entity, Column, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { Circle } from './Circles';
import { UserMetaData } from './UserMetadata';

@Entity()
export class Likes {
  @PrimaryGeneratedColumn()
  autoid: number;

  @Column('tinyint')
  is_like: 0 | 1;

  @ManyToOne(() => Circle, circle => circle.likes)
  circle: Circle;

  @ManyToOne(() => UserMetaData, (meta) => meta.likes)
  user: UserMetaData;
}