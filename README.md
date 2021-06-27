# 基于 Koa + ws + TypeORM

- koa 搭建 http 服务器
- ws 搭建 websocket 服务器
- typeorm 处理数据库
- mysql 持久化存储
- redis 存储 token 以及离线消息队列(由于经过一段时间之后会自动断开，所以目前采用的方案是每次操作都新建一个连接实例，操作完成之后断开连接)
- 配套前端代码[young-chat](https://gitee.com/BluseYoung-web/young-chat)

## 开发进度

- [x] HTTP 服务器
- [x] WebSocket 服务器
- [x] 动态路由及控制器
- [x] post 登录返回 token
- [x] svg 验证码
- [x] 连接 websocket 进行 token 校验，成功继续，失败直接断开
- [x] 通过 websocket 上传图片/音频
- [x] 用户模块(登录，修改个人信息)
- [x] 动态模块(发表动态|删除动态、点赞|取消点赞、评论|回复评论|删除评论)
- [x] 好友模块(搜索、发送好友申请、处理好友申请、删除好友)
- [ ] 聊天室模块(单聊、群聊，发送文本、图片、语音)

## 使用

- node 版本： 16+

```bash
# 装依赖
yarn
# 直接运行
yarn dev
# 编译为 js
yarn build
# 运行打包后的 js 文件
yarn pre
```