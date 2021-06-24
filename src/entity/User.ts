/*
 * @Author: zhangyang
 * @Date: 2021-04-08 10:12:17
 * @LastEditTime: 2021-06-24 18:07:54
 * @Description: 用户实体(表)
 */
import { Entity, PrimaryGeneratedColumn, Column, OneToOne, JoinColumn, JoinTable, ManyToMany, OneToMany } from 'typeorm';
import { UserMetaData } from './UserMetadata';
import { Circle } from './Circles';
import { Likes } from './Likes';
import { Comments } from './Comments';

@Entity()
export class User {
  @PrimaryGeneratedColumn()
  uid: number;

  @Column()
  tel: string;

  @Column()
  passwd: string;

  @ManyToMany(() => User, user => user.f_id)
  @JoinTable()
  f_id: User[];

  @OneToMany(() => Circle, circle => circle.user)
  circles: Circle[];

  @OneToMany(() => Likes, like => like.user)
  likes: Likes[];

  @OneToMany(() => Comments, comment => comment.user)
  comments: Comments[];
  
  @OneToOne(() => UserMetaData, meta => meta.user, {
    cascade: true // 保存用户的时候，自动保存相关联的元数据
  })
  @JoinColumn()
  metadata: UserMetaData;
}