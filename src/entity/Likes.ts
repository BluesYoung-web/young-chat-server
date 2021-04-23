/*
 * @Author: zhangyang
 * @Date: 2021-04-09 17:53:03
 * @LastEditTime: 2021-04-14 10:49:28
 * @Description: 点赞表
 */
import { Entity, Column, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { Circle } from './Circles';

@Entity()
export class Likes {
  @PrimaryGeneratedColumn()
  autoid: number;

  @Column('tinyint')
  is_like: 0 | 1;

  @ManyToOne(() => Circle, circle => circle.likes)
  circle: Circle;
}