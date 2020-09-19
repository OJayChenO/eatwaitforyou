// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init()
const db = cloud.database()
const _ = db.command
// 云函数入口函数
exports.main = async(event, context) => {
  try {
    if (event.type == 0) {
      return await db.collection('menu')
        .where({
          '_id': event.menuId,
          'comments.id': event.commentId
        })
        .update({
          // data 字段表示需新增的 JSON 数据
          data: {
            'comments.$.replys': _.push({
              id: event.id,
              userId: event.userId,
              reply: event.reply,
              replyTime: event.replyTime,
            })
          }
        })
    }else{
      return await db.collection('work')
        .where({
          '_id': event.workId,
          'comments.id': event.commentId
        })
        .update({
          data: {
            'comments.$.replys': _.push({
              id: event.id,
              userId: event.userId,
              reply: event.reply,
              replyTime: event.replyTime,
            })
          }
        })
    }
  } catch (e) {
    console.error(e)
  }
}