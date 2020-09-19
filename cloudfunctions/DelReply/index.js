// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init()
const db = cloud.database()
const _ = db.command
// 云函数入口函数
exports.main = async (event, context) => {
  try {
    return await db.collection('menu')
      .where({
        '_id': event.menuId,
        'comments.id': event.cid
      })
      .update({
        // data 字段表示需新增的 JSON 数据
        data: {
          'comments.$.replys': _.pull({
            id: event.rid,
          })
        }
      })
  } catch (e) {
    console.error(e)
  }
}