const db = wx.cloud.database()
var DateUtil = require("../../utils/DateUtil.js")
Page({


  /**
   * 页面的初始数据
   */
  data: {
    show: false,
    loginOK: false,
    showDialog: false,
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
        title: '加载中...',
      })

      let user = this.data.user_info
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
            //提示
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

      }).catch(err => {
        console.log(err)
      })


      //关注通知
      wx.cloud.callFunction({
        // 要调用的云函数名称
        name: 'ToNotify',
        // 传递给云函数的参数
        data: {
          is_follow: !this.data.is_follow, //是否关注 false取消关注 true关注
          notice: 0, //消息类型   0关注 1收藏 2点赞 3评论 4回复
          sendId: mid, //发送者ID
          targetId: uid, //接受者ID
          isRead: 0, //消息是否已读   0未读  1已读
          createTime: DateUtil.formatTime(new Date()), //创建时间
        },
        success: res => {
          console.log(res)
        },
        fail: err => {
          console.log(err)
        },
        complete: () => {
          // ...
        }
      })

      // 延迟2秒反应时间
      setTimeout(function() {
        wx.hideLoading()
      }, 2000)
    }



  },

  //收藏作品
  toCollect() {
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
        title: '加载中...',
      })

      let menuId = this.data.detail._id
      let userId = this.data.myInfo._id
      let is_collect = this.data.is_collect
      wx.cloud.callFunction({
        // 要调用的云函数名称
        name: 'ToCollect',
        // 传递给云函数的event参数
        data: {
          userId: userId,
          menuId: menuId,
          is_collect: is_collect
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
              is_collect: !is_collect
            })
            //提示
            wx.showToast({
              icon: 'none',
              title: msg,
            })
            //更新详情
            that.readUserData()
            db.collection('menu')
              .doc(menuId)
              .get()
              .then(res => {
                // console.log(res.data)
                that.setData({
                  'detail.collect': res.data.collect,
                })
              })
              .catch(err => {
                console.error(err)
              })
          })

      }).catch(err => {
        console.log(err)
      }).finally()
      let self = that.data.self
      //收藏通知
      if (!self) {
        wx.cloud.callFunction({
          // 要调用的云函数名称
          name: 'ToNotify',
          // 传递给云函数的参数
          data: {
            type: 0, //发表类型  0菜谱 1作品
            postId: menuId, //发表ID
            notice: 1, //消息类型   0关注 1收藏 2点赞 3评论 4回复
            sendId: this.data.myInfo._id, //发送者ID
            targetId: this.data.user_info._id, //接受者ID
            is_collect: !is_collect, //是否收藏   true收藏 false取消收藏
            isRead: 0, //消息是否已读   0未读  1已读
            createTime: DateUtil.formatTime(new Date()), //创建时间
            title: this.data.detail.title //标题
          },
          success: res => {
            console.log(res)
          },
          fail: err => {
            console.log(err)
          },
          complete: () => {
            // ...
          }
        })
      }


      // 延迟2秒反应时间
      setTimeout(function() {
        wx.hideLoading()
      }, 2000)
    }

  },

  //展示评论区
  showComment() {
    wx.showLoading({
      title: '加载中',
    })
    this.setData({
      show: true
    })
    this.loadData()
    wx.hideLoading()
  },

  //关闭评论区
  onClose() {
    this.setData({
      show: false
    });
  },


  //晒作品
  upWork(e) {
    //判断是否登录
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
      // console.log("晒作品....",e)
      let id = e.currentTarget.dataset.id
      let name = e.currentTarget.dataset.name

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
    }
  },

  //删除作品 
  delMy(e) {
    let id = e.target.dataset.id;
    // console.log("id", id)
    wx.showModal({
      title: '删除提示',
      content: '是否确定删除该作品？',
      success(res) {
        if (res.confirm) {
          wx.showLoading({
            title: '删除中...',
          })
          // console.log('用户点击确定')
          //从数据库删除
          wx.cloud.callFunction({
            // 要调用的云函数名称
            name: 'Delmy',
            // 传递给云函数的event参数
            data: {
              menuId: id
            }
          }).then(res => {
            // console.log("删除成功", res)
            wx.hideLoading()
            wx.showToast({
              title: '删除成功',
              success: function() {
                wx.reLaunch({
                  url: '/pages/index/index',
                })
              }
            })
          }).catch(err => {
            console.log("删除失败", err)
          })

        } else if (res.cancel) {
          // console.log('用户点击取消')
        }
      }
    })

  },

  //评论输入
  inputComment(e) {
    let comment = e.detail.value
    this.setData({
      comment: comment
    })
  },

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
        let commentId = new Date().getTime()
        wx.cloud.callFunction({
          // 要调用的云函数名称
          name: 'ToComment',
          // 传递给云函数的event参数
          data: {
            type: 0, //评论类型 0菜谱 1作品
            id: commentId,
            menuId: detail._id,
            userId: myInfo._id,
            comment: comment,
            commentTime: DateUtil.formatTime(new Date()),
          }
        }).then(res => {
          console.log(res)
          //更新详情
          that.loadData()
        }).catch(err => {
          console.error(err)
        }).finally(fin => {
          let self = that.data.self
          //评论通知
          if (!self) {
            console.log("self",self)
            wx.cloud.callFunction({
              // 要调用的云函数名称
              name: 'ToNotify',
              // 传递给云函数的参数
              data: {
                type: 0, //发表类型  0菜谱 1作品
                notice: 3, //消息类型   0关注 1收藏 2点赞 3评论 4回复
                sendId: that.data.myInfo._id, //发送者ID
                targetId: that.data.user_info._id, //接受者ID
                isComment: true, //是否评价   true评价 false取消评价
                commentId: commentId, //评论ID
                isRead: 0, //消息是否已读   0未读  1已读
                createTime: DateUtil.formatTime(new Date()), //创建时间
                postId: that.data.detail._id, //发表ID
                title: that.data.detail.title, //标题
                content: that.data.comment, //内容
              },
              success: res => {
                console.log(res)
              },
              fail: err => {
                console.log(err)
              },
              complete: () => {
                // ...
              }
            })
          }
        })
        wx.hideLoading()
        wx.showToast({
          title: '评论成功',
        })
      }
    }

  },


  //删除评论
  delComment(e) {
    var that = this
    let id = e.currentTarget.dataset.id
    let menuId = this.data.detail._id
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
              type: 0,
              menuId: menuId,
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
          }).finally(fin => {
            let self = that.data.self
            //删除评论通知
            if (!self) {
              wx.cloud.callFunction({
                // 要调用的云函数名称
                name: 'ToNotify',
                // 传递给云函数的参数
                data: {
                  notice: 3,
                  commentId: id, //评论ID
                  isComment: false, //是否评论   true评论 false删除评论
                },
                success: res => {
                  console.log(res)
                },
                fail: err => {
                  console.log(err)
                },
                complete: () => {
                  console.log("评论ID", id)
                }
              })
            }
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
          type: 0,
          menuId: detail._id,
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

  // 输入框聚焦
  // inputFocus() {
  //   this.setData({
  //     showIcon: true
  //   })
  // },

  // 输入框失去焦点
  // inputBlur() {
  //   this.setData({
  //     showIcon: false
  //   })
  // },


  //加载数据
  loadData() {
    var that = this
    let menuId = this.data.detail._id
    //加载菜谱详情
    db.collection('menu').doc(menuId)
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
    let user = this.data.user_info
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

    //判断是否收藏
    let collects = my.collects
    let menuId = this.data.detail._id
    // console.log("collects,menuId", collects, menuId)
    let collectIndex = collects.indexOf(menuId)
    // console.log("indexOf", a)
    if (collectIndex < 0) {
      console.log("未收藏")
      this.setData({
        is_collect: false
      })
    } else {
      console.log("已收藏")
      this.setData({
        is_collect: true
      })
    }

  },

  //预览封面
  showCover() {
    let cover = this.data.detail.menuCover
    let covers = []
    covers.push(cover)
    wx.previewImage({
      current: cover, // 当前显示图片的http链接
      urls: covers // 需要预览的图片http链接列表
    })
  },

  //预览图片
  showImg(e) {
    let index = e.currentTarget.dataset.index
    let steps = this.data.detail.steps
    let imgList = []
    for (let i = 0; i < steps.length; i++) {
      imgList.push(steps[i].img)
    }
    wx.previewImage({
      current: imgList[index], // 当前显示图片的http链接
      urls: imgList // 需要预览的图片http链接列表
    })
  },

  //查看作品详情
  toDetail(e) {
    // console.log('查看详情',e)
    let id = e.currentTarget.dataset.id
    // console.log(id)
    wx.navigateTo({
      url: '/pages/workshow/workshow?id=' + id,
      // success: function(res) {},
      // fail: function(res) {},
      // complete: function(res) {},
    })
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    wx.showLoading({
      title: '页面加载中...',
    })
    let id = options.id
    var that = this
    db.collection('menu').doc(id).get({
      success: function(res) {
        // console.log(res.data)
        that.setData({
          detail: res.data
        })
        // 查询用户信息
        let uid = res.data.userId
        db.collection('user').doc(uid).get({
          success: function(resu) {
            // console.log(resu.data)
            let avatar = resu.data.avatar
            let nickname = resu.data.nickname
            let detail = that.data.detail;
            let setNick = "detail.nickname"
            let setAva = "detail.avatar"
            that.setData({
              [setAva]: avatar,
              [setNick]: nickname,
              user_info: resu.data
            })

            //判断是否登录
            let loginOK = that.data.loginOK
            if (loginOK) {
              that.readUserData()
            }
            that.loadData()
          },
          fail: console.error
        })
      },
      fail: console.error
    })
    wx.hideLoading()

    // 从缓存获取浏览记录
    let records = wx.getStorageSync('records')
    this.setData({
      records: records
    })

    //浏览历史存入缓存
    records = this.data.records.length ? this.data.records : []
    let index = records.indexOf(id)
    if (index < 0) {
      records.unshift(id)
    } else {
      records.splice(index, 1)
      records.unshift(id)
    }
    wx.setStorageSync('records', records)

    //加载相关作品
    db.collection('work').where({
      menuId: id
    }).get().then(res => {
      // console.log(res.data)
      this.setData({
        workList: res.data
      })
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