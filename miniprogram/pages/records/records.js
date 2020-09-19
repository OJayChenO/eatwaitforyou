// pages/records/records.js
const db = wx.cloud.database()
const _ = db.command
Page({

  /**
   * 页面的初始数据
   */
  data: {

  },

  //选择菜谱
  selectMenu(e) {
    console.log('选择菜谱')
    let id = e.currentTarget.dataset.id
    // console.log("id",id)
    let name = e.currentTarget.dataset.name
    // console.log("name", name)
    let info = {}
    info['id'] = id
    info['name'] = name
    // console.log("info...",info)
    //将对象转为string
    var jsoninfo = JSON.stringify(info)
    // console.log("jsoninfo...", jsoninfo)

    //跳转到分享作品页面
    wx.navigateTo({
      url: '/pages/upload_work/upload_work?info=' + jsoninfo,
    })


  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    //从缓存读取浏览记录
    let records = wx.getStorageSync('records')
    this.setData({
      records: records
    })
    
    // 浏览记录详细信息
    if (records) {
      db.collection('menu').where({
        _id: _.in(records)
      }).get().then(res => {
        // console.log(res.data)
        this.setData({
          recordList: res.data
        })
      })
    }else{
      this.setData({
        msg:'暂无浏览记录'
      })
    }

  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function() {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function() {

  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function() {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function() {

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function() {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function() {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function() {

  }
})