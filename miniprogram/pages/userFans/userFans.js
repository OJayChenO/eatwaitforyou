// miniprogram/pages/userFollows/userFollows.js
const db = wx.cloud.database()
const _ = db.command
Page({

  /**
   * 页面的初始数据
   */
  data: {

  },

  //关注用户
  toFollow(e) {
    var that = this
    let loginOK = this.data.loginOK
    if (!loginOK) {
      wx.showToast({
        icon: 'none',
        title: '请先登录',
        success: function() {
          wx.navigateTo({
            url: '/pages/login/login',
          })
        }
      })
    } else {
      wx.showLoading({
        title: '加载中...',
      })

      let uid = e.currentTarget.dataset.uid
      let index = e.currentTarget.dataset.index
      console.log(index, uid)
      let follows = this.data.follows
      let is_follow = follows[index].is_follow

      let my = this.data.myInfo
      let mid = my._id
      wx.cloud.callFunction({
        // 要调用的云函数名称
        name: 'ToFollow',
        // 传递给云函数的event参数
        data: {
          userId: mid,
          follow: uid,
          is_follow: is_follow
        }
      }).then(res => {
        console.log(res)
        //查询数据库
        db.collection('user').doc(mid)
          .get().then(res => {
            // console.log("更新当前用户", res.data)
            let setmy = res.data;
            //更新用户缓存
            wx.setStorageSync('user', setmy)
            this.setData({
              myInfo: setmy,
            })
            that.readUserData(index)
          })
      }).catch(err => {
        console.log(err)
      }).finally(wx.hideLoading())
    }
  },

  //跳转到用户界面
  toUser(e) {
    let id = e.currentTarget.dataset.id
    wx.navigateTo({
      url: '../user/user?id=' + id,
    })
  },


  //读取用户数据
  readUserData(index) {
    // console.log('读取用户数据')
    let my = this.data.myInfo
    let mid = my._id
    let users = this.data.fans
    let uid = users[index]._id
    let follow = my.follow
    let setSelf = "fans[" + index + "].is_self"
    // 判断是否自己
    if (uid == mid) {
      console.log("自己")
      this.setData({
        [setSelf]: true
      })
    } else {
      this.setData({
        [setSelf]: false
      })
      // 判断是否关注
      let a = follow.indexOf(uid);
      let setFollow = "fans[" + index + "].is_follow"
      if (a < 0) {
        console.log("未关注")
        this.setData({
          [setFollow]: false
        })
      } else {
        console.log("已关注")
        this.setData({
          [setFollow]: true
        })
      }
    }
  },


  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    wx.showLoading({
      title: '页面加载中...',
    })

    let parseFans = JSON.parse(options.fans)
    // console.log("parseFans", parseFans)

    let that = this
    //获取用户缓存
    let user = wx.getStorageSync('user')
    if (user && user.name) {
      this.setData({
        loginOK: true,
        myInfo: user
      })
    }
    // let myInfo = this.data.myInfo
    db.collection('user').where({
      _id: _.in(parseFans)
    }).get().then(res => {
      // console.log(res.data)
      this.setData({
        fans: res.data
      })
      let fans = this.data.fans
      let loginOK = this.data.loginOK
      if (loginOK) {
        for (let i = 0; i < fans.length; i++) {
          that.readUserData(i)
        }
      }
    }).catch(err => {
      console.log(err);
    }).finally(wx.hideLoading())


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