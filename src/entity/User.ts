/*
 * @Author: zhangyang
 * @Date: 2021-04-08 10:12:17
 * @LastEditTime: 2021-06-23 16:56:32
 * @Description: 用户实体(表)
 */
import { Entity, PrimaryGeneratedColumn, Column, OneToOne, JoinColumn, JoinTable, ManyToMany } from 'typeorm';
import { UserMetaData } from './UserMetadata';

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
  
  @OneToOne(() => UserMetaData, meta => meta.user, {
    cascade: true // 保存用户的时候，自动保存相关联的元数据
  })
  @JoinColumn()
  metadata: UserMetaData;
}