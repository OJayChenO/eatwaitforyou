// pages/workshow/workshow.js 
const db = wx.cloud.database()
var DateUtil = require("../../utils/DateUtil.js")

Page({

  /**
   * 页面的初始数据
   */
  data: {

  },

  //预览图片
  showPic(e) {
    let index = e.currentTarget.dataset.index
    let imgs = this.data.detail.imgs
    let picList = []
    for (let i = 0; i < imgs.length; i++) {
      picList.push(imgs[i])
    }
    wx.previewImage({
      current: picList[index], // 当前显示图片的http链接
      urls: picList // 需要预览的图片http链接列表
    })
  },

  //跳转到用户界面
  toUser(e) {
    let id = e.currentTarget.dataset.id
    wx.navigateTo({
      url: '../user/user?id=' + id,
    })
  },

  //关注用户
  toFollow() {
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
        title: '操作中...',
      })
      let user = this.data.userInfo
      let my = this.data.myInfo
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
        //查询数据库
        db.collection('user').doc(mid)
          .get().then(res => {
            let setmy = res.data;
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
                that.readUserData()
                if (that.data.is_follow) {
                  user['fans'].push(my._id)
                  that.setData({
                    user_info: user
                  })
                } else {
                  // 删除方法
                  var remove = function(array, val) {
                    for (var i = 0; i < array.length; i++) {
                      if (array[i] == val) {
                        array.splice(i, 1);
                      }
                    }
                    return -1;
                  }
                  remove(user['fans'], my._id);
                  that.setData({
                    user_info: user
                  })
                }
              }
            })
          })
        //关闭等待弹窗
        wx.hideLoading()
      }).catch(err => {
        console.log(err)
      })
    }

  },

  //点赞
  toLike() {
    // console.log('点赞')
    let loginOK = this.data.loginOK
    let that = this
    //判断是否登录
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
        title: '操作中...',
      })

      let workId = this.data.detail._id
      let userId = this.data.myInfo._id
      let is_like = this.data.is_like
      wx.cloud.callFunction({
        // 要调用的云函数名称
        name: 'ToLike',
        // 传递给云函数的event参数
        data: {
          userId: userId,
          workId: workId,
          is_like: is_like
        }
      }).then(resm => {
        console.log(resm)
        let msg = resm.result.msg
        //查询数据库
        db.collection('user').doc(userId)
          .get().then(res => {
            let user = res.data
            //更新用户缓存
            wx.setStorageSync('user', user)
            this.setData({
              myInfo: user,
              is_like: !is_like
            })
            //提示
            wx.showToast({
              icon: 'none',
              title: msg,
            })
            //更新详情
            that.readUserData()
            db.collection('work')
              .doc(workId)
              .get()
              .then(res => {
                // console.log(res.data)
                that.setData({
                  'detail.like': res.data.like,
                })
              })
              .catch(err => {
                console.error(err)
              })
          })
        // 延迟2秒反应时间
        // setTimeout(function() {
        //   wx.hideLoading()
        // }, 2000)
      }).catch(err => {
        console.log(err)
        // handle error
      }).finally()
      wx.hideLoading()
    }


  },



  //展示评论区
  showComment() {
    // console.log("展示评论区")
    wx.showLoading({
      title: '加载中',
    })
    this.setData({
      show: true
    })
    // this.loadData()
    wx.hideLoading()
  },

  //关闭评论区
  onClose() {
    this.setData({
      show: false
    });
  },

  //评论输入
  inputComment(e) {
    let comment = e.detail.value
    this.setData({
      comment: comment
    })
  },

  // //输入时显示
  // showBtn() {
  //   this.setData({
  //     commentBtn: true
  //   })
  // },

  // //不输入时隐藏
  // hideBtn() {
  //   this.setData({
  //     commentBtn: false
  //   })
  // },

  //评论
  toComment() {
    let loginOK = this.data.loginOK
    let detail = this.data.detail
    let comment = this.data.comment
    let that = this
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
        title: '评论中...',
      })
      let myInfo = this.data.myInfo
      if (comment == undefined || comment == '') {
        wx.showToast({
          icon: 'none',
          title: '不能发送空白内容',
        })
      } else {
        wx.cloud.callFunction({
          // 要调用的云函数名称
          name: 'ToComment',
          // 传递给云函数的event参数
          data: {
            type: 1, //评论类型 0菜谱 1作品
            id: new Date().getTime(),
            workId: detail._id,
            userId: myInfo._id,
            comment: comment,
            commentTime: DateUtil.formatTime(new Date()),
          }
        }).then(res => {
          console.log(res)
          //更新详情
          that.loadData()
          wx.hideLoading()
          wx.showToast({
            title: '评论成功',
          })

        }).catch(err => {
          console.error(err)
        })
      }
    }

  },

  //删除评论
  delComment(e) {
    var that = this
    let id = e.currentTarget.dataset.id
    let workId = this.data.detail._id
    wx.showModal({
      title: '删除提示',
      content: '是否确定删除该评论？',
      success(res) {
        if (res.confirm) {
          wx.showLoading({
            title: '删除中...',
          })
          //从数据库删除
          wx.cloud.callFunction({
            // 要调用的云函数名称
            name: 'DelComment',
            // 传递给云函数的event参数
            data: {
              type: 1,
              workId: workId,
              id: id
            }
          }).then(res => {
            console.log(res)
            wx.hideLoading()
            //更新详情
            that.loadData()
            wx.showToast({
              title: '删除成功',
            })
          }).catch(err => {
            console.log(err)
            // handle error
          })

        } else if (res.cancel) {
          // console.log('用户点击取消')
        }
      }
    })
  },

  //回复评论
  reply(e) {
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
      let username = e.currentTarget.dataset.name
      let commentId = e.currentTarget.dataset.cid
      this.setData({
        showDialog: true,
        username: username,
        commentId: commentId,
        // flag: 1,
      })
    }
  },

  //回复输入
  replyInput(e) {
    let flag = this.data.flag
    let reply = e.detail.value
    let myname = this.data.myInfo.nickname
    let username = this.data.username
    // console.log("flag reply myname username", flag,reply,myname,username)
    reply = "@" + username + "：" + reply
    this.setData({
      reply: reply
    })

  },

  //回复提交
  replySubmit(e) {
    let reply = this.data.reply
    // let user = this.data.user_info
    let myInfo = this.data.myInfo
    let commentId = this.data.commentId
    let detail = this.data.detail
    var that = this
    if (reply == undefined || reply == '') {
      wx.showToast({
        icon: 'none',
        title: '不能发送空白内容',
        success: function() {
          that.setData({
            showDialog: true
          })
        }
      })

    } else {
      wx.showLoading({
        title: '回复中...',
      })
      wx.cloud.callFunction({
        // 要调用的云函数名称
        name: 'ToReply',
        // 传递给云函数的event参数
        data: {
          type: 1,
          workId: detail._id,
          commentId: commentId,
          id: new Date().getTime(),
          userId: myInfo._id,
          reply: reply,
          replyTime: DateUtil.formatTime(new Date()),
        }
      }).then(res => {
        console.log(res)
        wx.hideLoading()
        //更新详情
        that.loadData()
        wx.showToast({
          title: '回复成功',
        })
      }).catch(err => {
        console.log(err)
      })
    }
  },

  //删除回复
  delReply(e) {
    let cid = e.currentTarget.dataset.cid
    let rid = e.currentTarget.dataset.rid
    let detail = this.data.detail
    // let tripId = this.data.tripId
    let menuId = detail._id
    var that = this
    wx.showModal({
      title: '删除提示',
      content: '是否确定删除该回复？',
      success(res) {
        if (res.confirm) {
          wx.showLoading({
            title: '删除中...',
          })
          //从数据库删除
          wx.cloud.callFunction({
            // 要调用的云函数名称
            name: 'DelReply',
            // 传递给云函数的event参数
            data: {
              menuId: menuId,
              cid: cid,
              rid: rid
            }
          }).then(res => {
            console.log(res)
            //更新详情
            that.loadData()
            wx.hideLoading()
            wx.showToast({
              title: '删除成功',
            })
          }).catch(err => {
            console.log(err)
          })

        } else if (res.cancel) {
          // console.log('用户点击取消')
        }
      }
    })
  },

  //回复用户回复
  answer(e) {
    let username = e.currentTarget.dataset.name
    let commentId = e.currentTarget.dataset.cid
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
      this.setData({
        showDialog: true,
        username: username,
        // flag: 1,
        commentId: commentId,
      })
    }

  },

  //加载数据
  loadData() {
    var that = this
    let workId = this.data.detail._id
    //加载作品详情
    db.collection('work').doc(workId)
      .get().then(res => {
        var comments = res.data.comments
        if (comments) {
          for (let i = 0; i < comments.length; i++) {
            let userId = comments[i].userId
            db.collection('user')
              .doc(userId)
              .get()
              .then(resu => {
                let nickname = resu.data.nickname
                let avatar = resu.data.avatar
                let setNick = "detail.comments[" + i + "].nickname"
                let setAva = "detail.comments[" + i + "].avatar"
                this.setData({
                  [setNick]: nickname,
                  [setAva]: avatar,
                })
              })
              .catch(err => {
                console.error(err)
              })
            var replys = comments[i].replys ? comments[i].replys : []
            for (let j = 0; j < replys.length; j++) {
              let userId = replys[j].userId
              db.collection('user')
                .doc(userId)
                .get()
                .then(resu => {
                  let nickname = resu.data.nickname
                  let avatar = resu.data.avatar
                  let setNick = "detail.comments[" + i + "].replys[" + j + "].nickname"
                  let setAva = "detail.comments[" + i + "].replys[" + j + "].avatar"
                  this.setData({
                    [setNick]: nickname,
                    [setAva]: avatar,
                  })
                })
                .catch(err => {
                  console.error(err)
                })
            }
          }
        }

        this.setData({
          'detail.comments': res.data.comments,
        })

      }).catch(err => {
        console.error(err);
      })
  },


  //读取用户数据
  readUserData() {
    let user = this.data.userInfo
    let my = this.data.myInfo
    let uid = user._id
    let mid = my._id
    let follow = my.follow

    // 判断是否自己
    if (uid == mid) {
      console.log('自己')
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

    //判断是否点赞
    let likes = my.likes
    let workId = this.data.detail._id
    // console.log("likes,workId", likes, workId)
    let likeIndex = likes.indexOf(workId)
    // console.log("indexOf", likeIndex)
    if (likeIndex < 0) {
      console.log("未点赞")
      this.setData({
        is_like: false
      })
    } else {
      console.log("已点赞")
      this.setData({
        is_like: true
      })
    }

  },


  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    wx.showLoading({
      title: '页面加载中...',
    })

    // 获取用户缓存
    let user = wx.getStorageSync('user')
    if (user && user.name) {
      this.setData({
        loginOK: true,
        myInfo: user,
      })
    } else {
      this.setData({
        loginOK: false
      })
    }

    // console.log("跳转到作品详情页面", options)
    let id = options.id
    // console.log("跳转id", id)
    let that = this
    db.collection('work').doc(id).get({
      success: function(res) {
        let uid = res.data.userId
        db.collection('user').doc(uid).get({
          success: function(resu) {
            // console.log('用户详情',resu.data)
            that.setData({
              userInfo: resu.data
            })
          },
          fail: console.error,
          complete: function() {
            wx.hideLoading()
            //判断是否登录
            let loginOK = that.data.loginOK
            if (loginOK) {
              that.readUserData()
            }
            that.loadData()
          }

        })
        // console.log("作品详情", res.data)
        that.setData({
          detail: res.data
        })




      },
      fail: console.error,
      complete: wx.hideLoading()
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