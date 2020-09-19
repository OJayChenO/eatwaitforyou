// miniprogram/pages/user/user.js
const db = wx.cloud.database();
const userDB = db.collection('user');
const _ = db.command
Page({
 
  /**
   * 页面的初始数据
   */
  data: {
    loginOK: false,
    is_follow: false,
    self: false
  },
  //关注用户
  follow(e) {
    // console.log("关注", e)
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
      let user = this.data.user_info
      let my = this.data.myInfo
      // console.log("用户信息", user)
      // console.log("我的信息", my)
      let uid = user._id
      let mid = my._id
      let follow = my.follow
      wx.cloud.callFunction({
        // 要调用的云函数名称
        name: 'ToFollow',
        // 传递给云函数的event参数
        data: {
          userId: mid,
          follow: uid,
          is_follow: this.data.is_follow
        }
      }).then(res => {
        console.log(res)
        wx.hideLoading()
        //查询数据库
        db.collection('user').doc(mid)
          .get().then(res => {
            // console.log("更新当前用户", res.data)
            let setmy = res.data;
            // console.log("setmy", setmy)
            //更新用户缓存
            wx.setStorageSync('user', setmy)
            this.setData({
              myInfo: setmy,
              is_follow: !this.data.is_follow,
            })
            wx.showToast({
              title: '操作成功',
              duration: 1500,
              success: function() {
                that.readData()
                if (that.data.is_follow) {
                  // console.log("粉丝+1", my._id, user.fans)
                  // console.log("======前======",user['fans'])
                  user['fans'].push(my._id)
                  // console.log("======后======", user['fans'])
                  that.setData({
                    user_info: user
                  })
                } else {
                  // console.log("粉丝-1", my._id, user.fans)

                  // 删除方法
                  var remove = function(array, val) {
                    for (var i = 0; i < array.length; i++) {
                      if (array[i] == val) {
                        array.splice(i, 1);
                      }
                    }
                    return -1;
                  }

                  // 调用方法
                  // console.log("======前======", user['fans'])
                  remove(user['fans'], my._id);
                  // console.log("======后======", user['fans'])
                  that.setData({
                    user_info: user
                  })
                }
              }
            })

          })
      }).catch(err => {
        console.log(err)
      })
    }

  },

  //预览头像
  showAvatar() {
    let avatar = this.data.user_info.avatar
    let picList = []
    picList.push(avatar)
    wx.previewImage({
      current: picList[0], // 当前显示图片的http链接
      urls: picList // 需要预览的图片http链接列表
    })
  },

  // 用户粉丝列表
  toFansList() {
    let fans = this.data.user_info.fans
    let jsonFans = JSON.stringify(fans)
    wx.navigateTo({
      url: '/pages/userFans/userFans?fans=' + jsonFans,
    })
  },

  // 用户关注列表
  toFollowList() {
    let follows = this.data.user_info.follow
    let jsonFollows = JSON.stringify(follows)
    wx.navigateTo({
      url: '/pages/userFollows/userFollows?follows=' + jsonFollows,
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
      success: function (res) {
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



  //数据读取
  readData() {
    // console.log("readData")
    // var that = this
    let user = this.data.user_info
    let my = this.data.myInfo
    // console.log("readData user", user)
    // console.log("readData my", my)
    let uid = user._id
    let mid = my._id
    let follow = my.follow
    // console.log("用户ID", uid)
    // console.log("关注ID", follow)
    // 判断是否自己
    if (uid == mid) {
      this.setData({
        self: true
      })
    } else {
      this.setData({
        self: false
      })
      // 判断是否关注
      let a = follow.indexOf(uid);
      // console.log("indexOf", a)
      if (a < 0) {
        console.log("未关注")
        this.setData({
          is_follow: false
        })
      } else {
        console.log("已关注")
        this.setData({
          is_follow: true
        })
      }
    }

  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    // console.log("onLoad options", options)
    wx.showLoading({
      title: '页面加载中',
    })
    // 获取用户缓存
    let user = wx.getStorageSync('user')
    // console.log("用户信息", user)
    if (user && user.name) {
      this.setData({
        loginOK: true,
        myInfo: user,
      })
      // this.readData()
    } else {
      this.setData({
        loginOK: false
      })
    }


    let loginOK = this.data.loginOK
    let id = options.id
    db.collection('user').doc(id)
      .get().then(res => {
        // console.log("user_info", res.data);
        this.setData({
          user_info: res.data
        })
        if (loginOK) {
          this.readData()
        }

        
        //查询用户作品
        let user_info = this.data.user_info
        let uid = user_info._id;
        let that = this
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


        //查询用户收藏作品
        let collects = user_info.collects
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

      }).catch(err => {
        console.log(err);
      })




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