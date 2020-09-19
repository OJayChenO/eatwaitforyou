// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init()
const db = cloud.database()
const userDB = db.collection('user');
const workDB = db.collection('work');
const _ = db.command

// 云函数入口函数
exports.main = async (event, context) => {

  if (event.is_like) {
    const a = await userDB.doc(event.userId).update({
      data: {
        likes: _.pull(event.workId)
      }
    })
    const b = await workDB.doc(event.workId).update({
      data: {
        like: _.inc(-1)
      }
    })
    return {
      a,
      b,
      msg: "取消点赞成功"
    }
  } else {
    const a = await userDB.doc(event.userId).update({
      // data 传入需要局部更新的数据
      data: {
        likes: _.push(event.workId)
      }
    })
    const b = await workDB.doc(event.workId).update({
      // data 传入需要局部更新的数据
      data: {
        like: _.inc(1)
      }
    })
    return {
      a,
      b,
      msg: "点赞成功"
    }
  }




}