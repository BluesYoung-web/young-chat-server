/*
 * @Author: zhangyang
 * @Date: 2021-06-26 16:08:40
 * @LastEditTime: 2021-06-26 16:45:33
 * @Description: 聊天室
 */
import { Column, Entity, PrimaryGeneratedColumn, ManyToMany, JoinTable } from 'typeorm';
import { User } from './User';

@Entity()
export class ChatRoom {
  @PrimaryGeneratedColumn()
  autoid: number;

  /**
   * 群名
   */
  @Column({ default: '' })
  name: string;

  /**
   * 群头像
   */
  @Column({ default: '' })
  cover: string;

  /**
   * owner 群主 uid
   * 为 0 时，表示私聊
   * 其余表示群聊
   */
  @Column({ default: 0 })
  owner: number;

  @ManyToMany(() => User, user => user.all_rooms)
  @JoinTable()
  users: User[];
}