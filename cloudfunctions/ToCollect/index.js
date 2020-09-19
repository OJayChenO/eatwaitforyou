// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init()
const db = cloud.database()
const userDB = db.collection('user');
const menuDB = db.collection('menu');
const _ = db.command

// 云函数入口函数
exports.main = async (event, context) => {

  if (event.is_collect) {
    const a = await userDB.doc(event.userId).update({
      // data 传入需要局部更新的数据
      data: {
        collects: _.pull(event.menuId)
      }
    })
    const b = await menuDB.doc(event.menuId).update({
      // data 传入需要局部更新的数据
      data: {
        collect: _.inc(-1)
      }
    })
    return {
      a,
      b,
      msg: "取消收藏成功"
    }
  } else {
    const a = await userDB.doc(event.userId).update({
      // data 传入需要局部更新的数据
      data: {
        collects: _.push(event.menuId)
      }
    })
    const b = await menuDB.doc(event.menuId).update({
      // data 传入需要局部更新的数据
      data: {
        collect: _.inc(1)
      }
    })
    return {
      a,
      b,
      msg: "已保存至我的收藏"
    }
  }




}