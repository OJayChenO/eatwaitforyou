// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init()
const db = cloud.database()
const userDB = db.collection('user');
const _ = db.command

// 云函数入口函数
exports.main = async (event, context) => {

  if (event.is_follow) {
    const fol =  await userDB.doc(event.userId).update({
      // data 传入需要局部更新的数据
      data: {
        follow: _.pull(event.follow)
      }
    })
    const fan =  await userDB.doc(event.follow).update({
      // data 传入需要局部更新的数据
      data: {
        fans: _.pull(event.userId)
      }
    })
    return {
      fol, 
      fan,
      msg:"取消关注成功",
    }
  } else {
    const fol = await userDB.doc(event.userId).update({
      // data 传入需要局部更新的数据
      data: {
        follow: _.push(event.follow)
      }
    })
    const fan = await userDB.doc(event.follow).update({
      // data 传入需要局部更新的数据
      data: {
        fans: _.push(event.userId)
      }
    })
    return {
      fol,
      fan,
      msg: "关注成功",
    }
  }




}