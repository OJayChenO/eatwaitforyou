// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init()
const db = cloud.database()
const userDB = db.collection('user');
const _ = db.command
// 云函数入口函数
exports.main = async(event, context) => {
  //return event
  return await userDB.where({
    _id: event.userId
  }).get().then(res => {
    try {
      return userDB.doc(event.userId).update({
        // data 传入需要局部更新的数据
        data: {
          phone: event.phone,
          address: event.address,
          nickname: event.nickname,
          avatar: event.avatar,
          cover: event.cover,
          motto: event.motto,
          
        }
      })
    } catch (e) {
      console.error(e)
    }
  }).catch(err => {
    console.log(err);
  })

}