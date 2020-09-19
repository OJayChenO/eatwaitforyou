// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init()
const db = cloud.database()
const _ = db.command
// 云函数入口函数
exports.main = async(event, context) => {

  const a = await db.collection('menu')
    .doc(event.id).update({
      data: {
        watch: _.inc(1)
      }
    })

  return {
    a,
    msg: "setCount"
  } 


}