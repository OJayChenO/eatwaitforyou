// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init()
const db = cloud.database()
const msgDB = db.collection('message');
const _ = db.command

// 云函数入口函数
exports.main = async(event, context) => {
  try {
    return await msgDB.where({
        targetId: event.targetId,
        notice: event.notice
      })
      .update({
        data: {
          isRead: event.isRead, 
        },
      })
  } catch (e) {
    console.error(e)
  }
}