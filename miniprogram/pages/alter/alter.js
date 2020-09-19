// miniprogram/pages/alter/alter.js
// 获取数据库引用
const db = wx.cloud.database();
const userDB = db.collection('user');
Page({

  /**
   * 页面的初始数据
   */
  data: {
    phone: '',
    address: '',
    nickname: '',
    avatar: '',
    motto: '',
    userId: '',
  },

  //获取输入的电话
  getPhone(event) {
    // console.log('电话', event.detail.value)
    this.setData({
      phone: event.detail.value
    })
  },
  //获取输入的地址
  getAddress(event) {
    // console.log('地址', event.detail.value)
    this.setData({
      address: event.detail.value
    })
  },
  //获取输入的昵称
  getNickname(event) {
    //console.log('昵称', event.detail.value)
    this.setData({
      nickname: event.detail.value
    })
  },
  //获取输入的个性签名
  getMotto(event) {
    //console.log('个性签名', event.detail.value)
    this.setData({
      motto: event.detail.value
    })
  },

  //上传头像
  uploadAva: function(evt) {
    var that = this;
    //选择图片
    wx.chooseImage({
      success(res) {
        const tempFilePaths = res.tempFilePaths
        //上传至云存储
        wx.cloud.uploadFile({
          cloudPath: 'food/' + new Date().getTime() + '.png',
          filePath: tempFilePaths[0], // 文件路径
          success: res => {
            console.log(res.fileID)
            that.setData({
              avatar: res.fileID
            })
          },
          fail: err => {
            console.error(err)
            // handle error
          }
        })
      }
    })
  },

  warn() {
    wx.showToast({
      icon: 'none',
      title: '账号不可修改',
    })
  },

  //保存修改
  saveAlter: function() {
    //console.log(evt)
    wx.cloud.callFunction({
      // 要调用的云函数名称
      name: 'ToAlter',
      // 传递给云函数的event参数
      data: {
        userId: this.data.userId,
        phone: this.data.phone,
        address: this.data.address,
        nickname: this.data.nickname,
        avatar: this.data.avatar,
        motto: this.data.motto
      }
    }).then(res => {
      console.log(res)
      //查询数据库
      userDB.where({
        _id: this.data.userInfo._id // 填入当前用户ID
      }).get().then(res => {
        //console.log("当前用户",res.data)
        let user = res.data[0];
        //更新用户缓存
        wx.setStorageSync('user', user)
      })
      wx.showToast({
        title: '保存成功',
        duration: 2000,
        success: function() {
          //定时返回
          setTimeout(function() {
            //console.log("保存成功"); 
            wx.navigateBack({})
          }, 2000);
        }
      })
    }).catch(err => {
      console.log(err)
    })
  },



  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    //获取用户缓存
    let user = wx.getStorageSync('user')
    if (user && user.name) {
      this.setData({
        phone: user.phone,
        address: user.address,
        nickname: user.nickname,
        avatar: user.avatar,
        motto: user.motto,
        userId: user._id,
        name: user.name
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
    //获取用户缓存
    let user = wx.getStorageSync('user')
    if (user && user.name) {
      this.setData({
        loginOK: true,
        userInfo: user
      })
    } else {
      this.setData({
        loginOK: false
      })
    }
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