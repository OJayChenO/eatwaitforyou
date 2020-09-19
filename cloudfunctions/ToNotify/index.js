// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init()
const db = cloud.database()
const msgDB = db.collection('message');
const _ = db.command

// 云函数入口函数
exports.main = async(event, context) => {
  //关注
  if (event.notice == 0) {
    try {
      return await db.collection('message').add({
        data: {
          isFollow: event.is_follow, //是否关注  false取消关注 true关注
          notice: event.notice, //消息类型   0关注 1收藏 2点赞 3评论 4回复
          sendId: event.sendId, //发送者ID
          targetId: event.targetId, //接受者ID
          isRead: 0, //消息是否已读   0未读  1已读
          createTime: event.createTime, //创建时间

        }
      })
    } catch (e) {
      console.error(e)
    }
  } else if (event.notice == 1) {
    //收藏
    try {
      return await db.collection('message').add({
        data: {
          type: event.type, //发表类型  0菜谱 1作品
          postId: event.postId, //发表ID
          is_collect: event.is_collect, //是否收藏   true收藏 false取消收藏
          notice: event.notice, //消息类型   0关注 1收藏 2点赞 3评论 4回复
          sendId: event.sendId, //发送者ID
          targetId: event.targetId, //接受者ID
          isRead: 0, //消息是否已读   0未读  1已读
          createTime: event.createTime, //创建时间
          title: event.title //标题
        }
      })
    } catch (e) {
      console.error(e)
    }
  } else if (event.notice == 3) {
    if (event.isComment) {
      // 评论
      try {
        return await db.collection('message').add({
          data: {
            type: event.type, //发表类型  0菜谱 1作品
            notice: event.notice, //消息类型   0关注 1收藏 2点赞 3评论 4回复
            sendId: event.sendId, //发送者ID
            targetId: event.targetId, //接受者ID
            isComment: event.isComment, //是否评论   true评论 false删除评论
            commentId: event.commentId, //评论ID
            isRead: event.isRead, //消息是否已读   0未读  1已读
            createTime: event.createTime, //创建时间
            postId: event.postId, //发表ID
            title: event.title, //标题
            content: event.content, //内容
          }
        })
      } catch (e) {
        console.error(e)
      }
    } else {
      //删除评论
      try {
        return await db.collection('message').where({
            commentId: event.commentId
          })
          .update({
            data: {
              isComment: event.isComment, //是否评论   true评论 false删除评论
            },
          })
      } catch (e) {
        console.error(e)
      }
    }
  }


}