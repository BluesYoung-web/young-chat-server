/*
 * @Author: zhangyang
 * @Date: 2021-04-08 10:12:17
 * @LastEditTime: 2021-06-30 11:22:19
 * @Description: 用户实体(表)
 */
import { Entity, PrimaryGeneratedColumn, Column, OneToOne, JoinColumn, JoinTable, ManyToMany, OneToMany } from 'typeorm';
import { UserMetaData } from './UserMetadata';
import { Circle } from './Circles';
import { Likes } from './Likes';
import { Comments } from './Comments';
import { FriendApply } from './FriendApply';
import { ChatRoom } from './ChatRoom';
import { Friend } from './Friend';

@Entity()
export class User {
  @PrimaryGeneratedColumn()
  @OneToMany(() => Friend, friend => friend.uid)
  uid: number;

  @Column()
  tel: string;

  @Column()
  passwd: string;

  @OneToMany(() => Friend, friend => friend.fid)
  f_id: Friend[];

  @OneToMany(() => Circle, circle => circle.user)
  circles: Circle[];

  @OneToMany(() => Likes, like => like.user)
  likes: Likes[];

  @OneToMany(() => Comments, comment => comment.user)
  comments: Comments[];

  @OneToMany(() => FriendApply, adds => adds.from)
  adds: FriendApply[];

  @OneToMany(() => FriendApply, apply => apply.to)
  applys: FriendApply[];

  @ManyToMany(() => ChatRoom, room => room.users)
  all_rooms: ChatRoom[];
  
  @OneToOne(() => UserMetaData, meta => meta.user, {
    cascade: true // 保存用户的时候，自动保存相关联的元数据
  })
  @JoinColumn()
  metadata: UserMetaData;
}