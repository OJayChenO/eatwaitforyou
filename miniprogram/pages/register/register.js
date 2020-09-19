// pages/regist/regist.js
let app = getApp();
const db = wx.cloud.database();
const userDB = db.collection('user');
let name = null;
let password = null;
let phone = null;
let address = null;
Page({

  /**
   * 页面的初始数据
   */
  data: {
    avatar: '/images/avatar.png',
    cover: '/images/cover.png',
    motto: '这家伙很懒，什么都没留下......',
  },

  //输入用户名
  inputName(event) {
    name = event.detail.value;
  },
  //输入密码
  inputPassword(event) {
    password = event.detail.value;
  },
  //输入手机号
  inputPhone(event) {
    phone = event.detail.value;
  },
  //输入地址
  inputAddress(event) {
    address = event.detail.value;
  },

  //注册用户信息
  saveuserinfo() {
    var that = this;
    wx.showLoading({
      title: '正在注册中...',
    })
    userDB.add({
      // data 字段表示需新增的 JSON 数据
      data: {
        name: name,
        password: password,
        phone: phone,
        address: address,
        fans: 0,
        follow: 0,
        collects: [],
        likes: [],
        nickname: name,
        avatar: this.data.avatar,
        cover: this.data.cover,
        motto: this.data.motto
      },
      success: function(res) {
        // res 是一个对象，其中有 _id 字段标记刚创建的记录的 id
        wx.showToast({
          title: '注册成功',
          success: function() {
            wx.navigateTo({
              url: '/pages/login/login',
            })
          }
        })
      },
      fail: function(err) {
        console.log(err)
      },
      　　　 //失败后的回调；
      complete: function(com) {
        wx.hideLoading()
      }　　　 //结束后的回调(成功，失败都会执行)
    })
  },

  //验证
  validation() {
    var that = this;
    //console.log(name + '...' + password + '...' + phone)
    //验证顺序 账号-》密码-》电话
    if (name == null) {
      wx.showToast({
        title: '账号不能为空',
        icon: "none"
      })
      return;
    } else if (password == null) {
      wx.showToast({
        title: '密码不能为空',
        icon: "none"
      })
      return;
    } else if (phone == null) {
      wx.showToast({
        title: '电话不能为空',
        icon: "none"
      })
      return;
    }


    userDB.where({
      name: name
    }).get({
      success: function(res) {
        let userInfos = res.data;
        if (userInfos && userInfos.length > 0) {
          //console.log('该账号已被注册')
          wx.showToast({
            icon: 'none',
            title: '该账号已被注册',
          })
        } else {
          that.saveuserinfo()
        }
      },
      fail: console.error
    })





  },

  //注册
  register() {
    let that = this;
    //查询用户是否已经注册
    userDB.where({
      _openid: app.globalData.openid // 填入当前用户 openid
    }).get({
      success: function(res) {
        let userInfos = res.data;
        if (userInfos && userInfos.length > 0) {
          wx.showToast({
            icon: 'none',
            title: '注册失败,您已注册',
          })
        } else {
          that.validation()
        }
      },
      fail: console.error
    })




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