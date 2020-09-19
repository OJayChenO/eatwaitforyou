// miniprogram/pages/result/result.js
const db = wx.cloud.database()
const _ = db.command
Page({

  /**
   * 页面的初始数据
   */
  data: {
    //滚动分类
    // scrolls: ['关注', '推荐', '菜谱', '家常菜', '烘焙', '小技巧'],
  },

  //查看详情
  toDetail(e) {
    let id = e.currentTarget.dataset.id
    wx.cloud.callFunction({
      // 云函数名称
      name: 'SetCount',
      // 传给云函数的参数
      data: {
        id: id
      },
      success: function (res) {
        console.log(res)
      },
      fail: console.error
    })

    wx.navigateTo({
      url: '/pages/detail/detail?id=' + id,
    })
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    wx.showLoading({
      title: '页面加载中...',
    })
    var that = this
    // console.log("搜索结果", options.result)
    let ids = JSON.parse(options.result)
    // console.log(ids)
    let count = ids.length
    if (count > 0) {
      //查询数据库
      db.collection('menu').where({
        _id: _.in(ids)
      }).get({
        success: function(res) {
          // console.log(res.data)
          let result = res.data
          that.setData({
            result: result
          })
          wx.hideLoading()
        },
        fail: console.error,
        // complete: wx.hideLoading()
      })
    } else {
      that.setData({
        msg: '暂无搜索结果'
      })
      wx.hideLoading()
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