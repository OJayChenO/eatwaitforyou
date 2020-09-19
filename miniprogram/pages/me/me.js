// miniprogram/pages/me/me.js

const db = wx.cloud.database();
const userDB = db.collection('user');
const _ = db.command
Page({

  /**
   * 页面的初始数据
   */
  data: {
    loginOK: false,
  },

  //登录
  toLogin: function() {
    wx.navigateTo({
      url: '/pages/login/login',
    })
  },
  //注册
  toRegist: function() {
    wx.navigateTo({
      url: '/pages/regist/regist',
    })
  },

  //预览头像
  showAvatar() {
    let avatar = this.data.userInfo.avatar
    let picList = []
    picList.push(avatar)
    wx.previewImage({
      current: picList[0], // 当前显示图片的http链接
      urls: picList // 需要预览的图片http链接列表
    })
  },

  //退出登陆
  tuichu() {
    wx.setStorageSync('user', null)
    let user = wx.getStorageSync('user')
    if (user && user.name) {
      this.setData({
        loginOK: true,
      })
    } else {
      this.setData({
        loginOK: false
      })
    }
    wx.reLaunch({
      url: '/pages/me/me',
    })
  },

  //修改资料
  alter: function(e) {
    wx.navigateTo({
      url: '/pages/alter/alter',
    })
  },

  //上传封面
  upCover: function() {
    //console.log("弹出框")
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
              cover: res.fileID
            })
            // console.log("上传照片", that.data.cover)
            // console.log("查询参数", that.data.userInfo)
            wx.cloud.callFunction({
              // 要调用的云函数名称
              name: 'ToAlter',
              // 传递给云函数的event参数
              data: {
                userId: that.data.userInfo._id,
                phone: that.data.userInfo.phone,
                address: that.data.userInfo.address,
                nickname: that.data.userInfo.nickname,
                avatar: that.data.userInfo.avatar,
                cover: that.data.cover
              }
            }).then(res => {
              console.log(res)
              // console.log("上传成功")
              // console.log("用户信息", that.data.userInfo)
              //查询数据库
              userDB.where({
                _id: that.data.userInfo._id // 填入当前用户ID
              }).get().then(res => {
                // console.log("当前用户", res.data)
                let user = res.data[0];
                //更新用户缓存
                wx.setStorageSync('user', user)
                that.setData({
                  userInfo: user
                })
              })
            }).catch(err => {
              console.log(err)
            })

            wx.showToast({
              title: '上传成功',
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



  // 粉丝列表
  fansList() {
    console.log("粉丝列表")
    wx.navigateTo({
      url: '/pages/fans/fans',
    })
  },

  // 关注列表
  followList() {
    console.log("关注列表")
    wx.navigateTo({
      url: '/pages/follow/follow',
    })
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
      success: function(res) {
        console.log(res)
      },
      fail: console.error
    })

    wx.navigateTo({
      url: '/pages/detail/detail?id=' + id,
    })
  },

  //用户界面
  toUser(e) {
    let id = e.currentTarget.dataset.id
    console.log(id)
    wx.navigateTo({
      url: '../user/user?id=' + id,
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
    //获取用户缓存
    let user = wx.getStorageSync('user')
    if (user && user.name) {
      this.setData({
        loginOK: true,
        userInfo: user
      })

      //查询我的作品
      let uid = user._id;
      let that = this
      wx.showLoading({
        title: '页面加载中...',
      })
      db.collection('menu').where({
        userId: uid
      }).get().then(res => {
        // console.log("我的作品", res.data);
        this.setData({
          menu: res.data
        })
        let menu = that.data.menu
        // 查询用户信息
        for (let i = 0; i < menu.length; i++) {
          let uid = menu[i].userId
          db.collection('user').doc(uid).get({
            success: function(resu) {
              // console.log("用户信息"+i, resu.data)
              let avatar = resu.data.avatar
              let nickname = resu.data.nickname
              let setNick = "menu[" + i + "].nickname"
              let setAva = "menu[" + i + "].avatar"
              that.setData({
                [setAva]: avatar,
                [setNick]: nickname,
              })
            },
            fail: console.error
          })
        }

      }).catch(err => {
        console.log(err);
      })


      //查询收藏作品
      let collects = user.collects
      db.collection('menu').where({
        _id: _.in(collects)
      }).get().then(res => {
        this.setData({
          collects: res.data
        })

        let collects = that.data.collects
        // 查询用户信息
        for (let i = 0; i < collects.length; i++) {
          let uid = collects[i].userId
          db.collection('user').doc(uid).get({
            success: function(resu) {
              // console.log("用户信息"+i, resu.data)
              let avatar = resu.data.avatar
              let nickname = resu.data.nickname
              let setNick = "collects[" + i + "].nickname"
              let setAva = "collects[" + i + "].avatar"
              that.setData({
                [setAva]: avatar,
                [setNick]: nickname,
              })
            },
            fail: console.error
          })
        }

      }).catch(err => {
        console.log(err);
      })

      wx.hideLoading()

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