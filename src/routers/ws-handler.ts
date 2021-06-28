/*
 * @Author: zhangyang
 * @Date: 2021-06-17 17:31:06
 * @LastEditTime: 2021-06-28 16:48:35
 * @Description: websocket 消息及其对应的处理函数
 */
import conf from "../../conf";

const map = new Map<string, { Controller: string, handler: string }>();

map.set(conf.Structor.获取当前用户信息, { Controller: 'UserController', handler: 'getUserInfo' });
map.set(conf.Structor.修改当前用户信息, { Controller: 'UserController', handler: 'setUserInfo' });
map.set(conf.Structor.查找用户, { Controller: 'UserController', handler: 'searchUser' });
map.set(conf.Structor.发送好友申请, { Controller: 'UserController', handler: 'sendFriendApply' });
map.set(conf.Structor.获取好友申请列表, { Controller: 'UserController', handler: 'getFriendApplyList' });
map.set(conf.Structor.获取用户好友列表, { Controller: 'UserController', handler: 'getFriendList' });
map.set(conf.Structor.处理好友申请, { Controller: 'UserController', handler: 'operateFriendApply' });
map.set(conf.Structor.删好友, { Controller: 'UserController', handler: 'delFriend' });

map.set(conf.Structor.聊天室内发消息, { Controller: 'RoomController', handler: 'sendMsg' });

map.set(conf.Structor.发动态, { Controller: 'CircleController', handler: 'sendCircle' });
map.set(conf.Structor.获取动态, { Controller: 'CircleController', handler: 'getCircle' });
map.set(conf.Structor.删除动态, { Controller: 'CircleController', handler: 'delCircle' });
map.set(conf.Structor.点赞, { Controller: 'CircleController', handler: 'clickLike' });
map.set(conf.Structor.获取评论列表, { Controller: 'CircleController', handler: 'getComments' });
map.set(conf.Structor.发表评论, { Controller: 'CircleController', handler: 'putUpComments' });
map.set(conf.Structor.删除评论, { Controller: 'CircleController', handler: 'delComments' });

export default (com: number, task: number, id:number) => {
  console.log(`${com}-${task}-${id}`);
  
  return map.get(`${com}-${task}-${id}`) || { Controller: 'ErrorController', handler: 'error' };
};