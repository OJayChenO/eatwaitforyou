// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init()
const db = cloud.database()
const _ = db.command
// 云函数入口函数
exports.main = async(event, context) => {
  try {
    // 类型 0菜谱 1作品
    if (event.type == 0) {
      return await db.collection('menu').doc(event.menuId)
        .update({
          data: {
            comments: _.pull({
              id: _.eq(event.id)
            })
          }
        })
    }else{
      return await db.collection('work').doc(event.workId)
        .update({
          data: {
            comments: _.pull({
              id: _.eq(event.id)
            })
          }
        })
    }
  } catch (e) {
    console.error(e)
  }
}