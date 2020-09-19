// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init()
const db = cloud.database()
const menuDB = db.collection('menu');
// 云函数入口函数
exports.main = async(event, context) => {
  //删除我的作品
  try {
    return await menuDB.doc(event.menuId).remove()
  } catch (e) {
    console.error(e)
  }
}