import { JoinColumn } from 'typeorm';
/*
 * @Author: zhangyang
 * @Date: 2021-04-08 10:12:17
 * @LastEditTime: 2021-04-14 12:53:21
 * @Description: 用户实体(表)
 */
import { Entity, PrimaryGeneratedColumn, Column, OneToOne } from 'typeorm';
import { UserMetaData } from './UserMetadata';

@Entity()
export class User {
  @PrimaryGeneratedColumn()
  uid: number;

  @Column()
  tel: string;

  @Column()
  passwd: string;
  
  @OneToOne(() => UserMetaData, (meta) => meta.user, {
    cascade: true // 保存用户的时候，自动保存相关联的元数据
  })
  @JoinColumn()
  metadata: UserMetaData;
}