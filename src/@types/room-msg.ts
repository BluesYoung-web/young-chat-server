/*
 * @Author: zhangyang
 * @Date: 2021-06-26 16:31:52
 * @LastEditTime: 2021-06-30 08:30:28
 * @Description: 聊天室消息的数据结构
 */
export enum MsgType {
  '系统消息' = 0,
  '文本消息' = 1,
  '图片消息' = 2,
  '语音消息' = 3,
  '其他' = 4
}
export interface RoomMsg {
  /**
   * 聊天室 id
   */
  autoid: number;
  /**
   * 聊天室类型(群主uid)
   */
  owner: number;
  /**
   * 消息类型
   */
  msg_type: MsgType;
  /**
   * 消息内容
   */
  content: any;
  /**
   * 发送时间
   */
  send_time: number;
  /**
   * 发送者头像
   */
  send_avatar?: string;
  /**
   * 发送者 uid
   */
  send_id?: number;
  /**
   * 发送者昵称
   */
  send_nick?: string;
  /**
   * 额外参数
   */
  extra?: any;
}