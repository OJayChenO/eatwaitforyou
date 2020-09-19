// pages/login/login.js
let app = getApp();
// 获取数据库引用
const db = wx.cloud.database();
const userDB = db.collection('user');


Page({

  /**
   * 页面的初始数据
   */
  data: {
    loginOK: false
  },

  //登录表单
  loginform: function(evt) {
    // let that = this
    let account = evt.detail.value.account;
    let password = evt.detail.value.password;
    if (account == '' || password == '') {
      // console.log('账号密码为空')
      wx.showToast({
        icon: 'none',
        title: '账号密码不能为空',
      })
    } else {
      wx.showLoading({
        title: '正在登录中...',
      })
      //登陆获取用户信息
      userDB.where({
        name: account
      }).get({
        success: function(res) {
          //console.log(res.data)
          let userInfos = res.data;
          if (userInfos && userInfos.length > 0) {
            let user = userInfos[0];
            //console.log("true")
            if (account === user.name && password === user.password) {
              //console.log("success")
              wx.showToast({
                title: '登录成功',
              })

              //保存用户登陆状态
              wx.setStorageSync('user', user)
              var timestamp = Date.parse(new Date())
              var expiration = timestamp + 24 * 60 * 60 * 1000 //登录状态保持24小时
              wx.setStorageSync("expiration", expiration)

              //切换底部导航栏
              wx.switchTab({
                url: '/pages/me/me',
              })

            } else {
              //console.log("fail")
              wx.showToast({
                title: '账号密码错误',
                icon: 'none'
              })
            }
          } else {
            //console.log("false")
            wx.showToast({
              title: '账号密码错误',
              icon: 'none'
            })
          }
        },
        fail: console.error,
        complete: wx.hideLoading()
      })
    }
  },

  //注册
  toRegister: function() {
    wx.navigateTo({
      url: '/pages/register/register',
    })
  },

  //账号验证
  accountInput: function() {

  },


  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {

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