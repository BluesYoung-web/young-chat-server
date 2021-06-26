/*
 * @Author: zhangyang
 * @Date: 2021-06-26 16:31:52
 * @LastEditTime: 2021-06-26 16:48:04
 * @Description: 聊天室消息的数据结构
 */
export enum MsgType {
  '系统消息' = 0,
  '文本消息' = 1,
  '语音消息' = 2,
  '图片消息' = 3,
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
   * 发送者 uid
   */
  send_id?: number;
}