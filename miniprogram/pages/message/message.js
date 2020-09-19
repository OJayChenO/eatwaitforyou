// pages/message/message.js
const db = wx.cloud.database()
Page({

  /**
   * 页面的初始数据
   */
  data: {},

  // 下拉列表
  onChange(event) {
    let index = event.detail
    let mid = this.data.myInfo._id
    let that = this
    // console.log('菜单项', index)
    this.setData({
      activeNames: event.detail,
    });
    if (index == 1) {
      console.log('关注')
      //关注消息
      wx.cloud.callFunction({
        // 要调用的云函数名称
        name: 'ReadMsg',
        // 传递给云函数的参数
        data: {
          notice: 0, //消息类型   0关注 1收藏 2点赞 3评论 4回复
          targetId: mid, //接受者ID
          isRead: 1, //消息是否已读   0未读  1已读
        },
        success: res => {
          // console.log(res)
          // that.onLoad()
          that.setData({
            count0: 0
          })
        },
        fail: err => {
          console.log(err)
        },
      })

    } else if (index == 2) {
      console.log('收藏')
      //收藏消息
      wx.cloud.callFunction({
        // 要调用的云函数名称
        name: 'ReadMsg',
        // 传递给云函数的参数
        data: {
          notice: 1, //消息类型   0关注 1收藏 2点赞 3评论 4回复
          targetId: mid, //接受者ID
          isRead: 1, //消息是否已读   0未读  1已读
        },
        success: res => {
          // console.log(res)
          that.setData({
            count1: 0
          })
        },
        fail: err => {
          console.log(err)
        },
      })
    } else if (index == 3) {
      console.log('点赞')
    } else if (index == 4) {
      console.log('评论')
      //评论消息
      wx.cloud.callFunction({
        // 要调用的云函数名称
        name: 'ReadMsg',
        // 传递给云函数的参数
        data: {
          notice: 3, //消息类型   0关注 1收藏 2点赞 3评论 4回复
          targetId: mid, //接受者ID
          isRead: 1, //消息是否已读   0未读  1已读
        },
        success: res => {
          // console.log(res)
          that.setData({
            count3: 0
          })
        },
        fail: err => {
          console.log(err)
        },
      })
    } else if (index == 5) {
      console.log('回复')
    }

  },

  // 加载消息
  loadMsg() {
    console.log('加载消息')
    let msgs = this.data.messageList
    // console.log('msgs', msgs)
    let that = this
    let count = 0
    let count0 = 0
    let count1 = 0
    let count2 = 0
    let count3 = 0
    let count4 = 0
    for (let i = 0; i < msgs.length; i++) {
      if (msgs[i].isRead == 0) {
        count += 1
        that.setData({
          count: count
        })
        if (msgs[i].notice == 0) {
          count0 += 1;
          that.setData({
            count0: count0
          })
        } else if (msgs[i].notice == 1) {
          count1 += 1;
          that.setData({
            count1: count1
          })
        } else if (msgs[i].notice == 2) {
          count2 += 1;
          that.setData({
            count2: count2
          })
        } else if (msgs[i].notice == 3) {
          count3 += 1;
          that.setData({
            count3: count3
          })
        } else if (msgs[i].notice == 4) {
          count4 += 1;
          that.setData({
            count4: count4
          })
        }
      }
    }

  },


  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    wx.showLoading({
      title: '数据加载中...',
      mask: true,
    })
    //获取用户缓存
    let user = wx.getStorageSync('user')
    if (user) {
      this.setData({
        loginOK: true,
        myInfo: user,
      })
    } else {
      this.setData({
        loginOK: false
      })
    }

    // 查询消息列表
    let that = this
    let mid = this.data.myInfo._id
    db.collection('message').where({
      targetId: mid
    }).get({
      success: function(res) {
        console.log(res.data)
        that.setData({
          messageList: res.data
        })
        for (let i = 0; i < res.data.length; i++) {
          // 加载用户信息
          let sendId = res.data[i].sendId
          db.collection('user')
            .doc(sendId)
            .get()
            .then(resu => {
              // console.log('resu', resu)
              let nickname = resu.data.nickname
              let avatar = resu.data.avatar
              let setNick = "messageList[" + i + "].nickname"
              let setAva = "messageList[" + i + "].avatar"
              that.setData({
                [setNick]: nickname,
                [setAva]: avatar,
              })
            })
            .catch(err => {
              console.error(err)
            }).finally(fin => {

              // 消息分类
              var msg0 = []
              var msg1 = []
              var msg2 = []
              var msg3 = []
              var msg4 = []
              var messageList = that.data.messageList
              for (let i = 0; i < messageList.length; i++) {
                let notice = messageList[i].notice
                if (notice == 0) {
                  msg0.push(messageList[i])
                  that.setData({
                    msg0: msg0
                  })
                } else if (notice == 1) {
                  msg1.push(messageList[i])
                  that.setData({
                    msg1: msg1
                  })
                } else if (notice == 2) {
                  msg2.push(messageList[i])
                  that.setData({
                    msg2: msg2
                  })
                } else if (notice == 3) {
                  msg3.push(messageList[i])
                  that.setData({
                    msg3: msg3
                  })
                } else if (notice == 4) {
                  msg4.push(messageList[i])
                  that.setData({
                    msg4: msg4
                  })
                }
              }

            })
        }



      },
      fail: console.error,
      complete: function() {
        that.loadMsg()
      }
    })
    wx.hideLoading()
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