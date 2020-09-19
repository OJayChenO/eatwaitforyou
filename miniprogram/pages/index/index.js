var DateUtil = require("../../utils/DateUtil.js");
var touchLRnum = 10;
var db = wx.cloud.database()
const command = db.command
Page({

  /**
   * 页面的初始数据
   */
  data: {
    //分类
    label: [{
        icon: '/images/zhongcan.png',
        text: '中餐'
      },
      {
        icon: '/images/xican.png',
        text: '西餐'
      },
      {
        icon: '/images/mianshi.png',
        text: '面食'
      },
      {
        icon: '/images/youzha.png',
        text: '油炸'
      },
      {
        icon: '/images/baotang.png',
        text: '煲汤'
      },
      {
        icon: '/images/tiandian.png',
        text: '甜点'
      },
      {
        icon: '/images/shaokao.png',
        text: '烧烤'
      },
      {
        icon: '/images/qingzheng.png',
        text: '清蒸'
      },
      {
        icon: '/images/hongshao.png',
        text: '红烧'
      },
      {
        icon: '/images/xiangjian.png',
        text: '香煎'
      },
    ],
    //滚动分类
    scrolls: ['菜谱', '推荐', '中餐', '西餐', '烧烤', '烘焙'],
    //分类默认选中
    navIndex: 0,
    mcategory: '菜谱',
    //用户作品
    menu: [],
    show: false,
    // loginOK: false,
  },


  //跳转搜索页
  goSearch() {
    wx.navigateTo({
      url: '/pages/search/search',
    })
  },

  //上传
  add() {
    this.setData({
      show: true
    });
  },

  //关闭弹框
  onClose() {
    this.setData({
      show: false
    });
  },

  //分享菜谱
  upMenu() {
    console.log("分享菜谱")
    //判断是否登录
    let loginOK = this.data.loginOK
    // console.log("loginOK", loginOK)
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
      //跳转到分享菜谱页面
      wx.navigateTo({
        url: '/pages/upload_menu/upload_menu',
      })
    }

  },

  //分享作品
  upWork() {
    console.log("分享作品")
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
      //跳转到分享作品页面
      wx.navigateTo({
        url: '/pages/upload_work/upload_work',
      })
    }
  },

  //标签搜索
  toSearch(e) {
    let label = e.currentTarget.dataset.name
    wx.showLoading({
      title: '正在搜索中...',
    })
    //数据库搜索
    db.collection("menu").where(command.or([ //where中满足对象数组中的任意一个条件即成立
        {
          title: {
            $regex: '.*' + label,
            $options: 'i'
          }
        },
        //模糊匹配title，category字段的内容，option='i'表示不区分大小写
        {
          categorys: {
            $regex: '.*' + label,
            $options: 'i'
          }
        },
        { //对象数组指定字段的模糊查询条件写法
          'foods.food': { //foods是评论的对象数组，food是对象的一个字段
            $regex: '.*' + label, //只要foods中任意一个对象的food包含keyword
            $options: 'i' //都将满足模糊查询的条件
          }
        }
      ]))
      .get()
      .then(res => {
        let count = res.data.length
        var ids = []
        for (let i = 0; i < count; i++) {
          let id = res.data[i]._id
          ids.push(id)
        }
        let result = JSON.stringify(ids)
        wx.navigateTo({
          url: '/pages/result/result?result=' + result,
        })
      })
      .catch(err => {
        console.error(err)
      }).finally(wx.hideLoading())
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
    // console.log(id)
    wx.navigateTo({
      url: '../user/user?id=' + id,
    })
  },

  // 消息列表
  goMessage() {
    console.log('消息列表')
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
      //跳转到消息页面
      wx.navigateTo({
        url: '/pages/message/message',
      })
    }

  },

  //选择菜单
  changeTitle: function(e) {
    let chooseNav = e.currentTarget.dataset.type;
    let name = e.currentTarget.dataset.name;
    console.log(chooseNav, name)
    let This = this;
    if (chooseNav != This.data.navIndex) {
      This.setData({
        mcategory: name,
        navIndex: chooseNav,
      });

      // This.initFun(); //初始化 / 清空 页面数据
      // This.getListData(); //获取页面列表数据
    }
  },
  //左右滑动 切换菜单
  touchStart: function(e) {
    if (e.touches.length == 1) {
      let This = this;
      This.setData({
        startX: e.touches[0].clientX,
        startY: e.touches[0].clientY,
      });
    }
  },
  touchMove: function(e) {
    if (e.touches.length == 1) {
      let This = this;

      let moveX = e.touches[0].clientX;
      let diffX = This.data.startX - moveX;

      let moveY = e.touches[0].clientY;
      let diffY = This.data.startY - moveY;

      let moveLeft = 'left:0px;';

      if (Math.abs(diffY) < Math.abs(diffX)) {
        if (diffX < 0 && This.data.navIndex > 0) { //向右
          //moveLeft = 'left:' + -(diffX < touchLRnum ? -touchLRnum : diffX) + 'px;';
          moveLeft = 'left:' + -diffX + 'px;';
        } else if (diffX > 0 && This.data.navIndex < This.data.scrolls.length - 1) { //向左
          //moveLeft = 'left:-' + (diffX > touchLRnum ? touchLRnum : diffX) + 'px;';
          moveLeft = 'left:-' + diffX + 'px;';
        }

        This.setData({
          ifCanScroll: false, //列表处左右滑动时设为false，这样页面不会滚动影响页面体验
        });
      } else {
        This.setData({
          ifCanScroll: true, //列表处左右滑动时设为false，这样页面不会滚动影响页面体验
        });
      }

      This.setData({
        moveLeft: moveLeft
      });
    }
  },
  touchEnd: function(e) {

    if (e.changedTouches.length == 1) {
      let This = this;

      let endX = e.changedTouches[0].clientX;
      let diffX = This.data.startX - endX;

      let endY = e.changedTouches[0].clientY;
      let diffY = This.data.startY - endY;

      let moveLeft = 'left:0px;';

      if (Math.abs(diffY) < Math.abs(diffX)) {
        if (diffX < 0 && diffX < -touchLRnum && This.data.navIndex > 0) { //向右
          let moveEndNavIndex = This.data.navIndex - 1;
          This.setData({
            navIndex: moveEndNavIndex
          });

          console.log("右滑", e);
          let i = This.data.navIndex;
          let cats = This.data.scrolls

          This.setData({
            mcategory: cats[i]
          });

        } else if (diffX > 0 && diffX > touchLRnum && This.data.navIndex < This.data.scrolls.length - 1) { //向左
          let moveEndNavIndex = This.data.navIndex + 1;
          This.setData({
            navIndex: moveEndNavIndex
          });

          console.log("左滑", e);
          let i = This.data.navIndex;
          let cats = This.data.scrolls

          This.setData({
            mcategory: cats[i]
          });

        }
      }

      This.setData({
        moveLeft: moveLeft,
        ifCanScroll: true, //列表处左右滑动时设为false，这样页面不会滚动影响页面体验
      });
    }

  },

  // 加载消息
  loadMsg() {
    // console.log('加载消息')
    let msgs = this.data.messageList
    let that = this
    let count = 0
    for (let i = 0; i < msgs.length; i++) {
      if (msgs[i].isRead == 0) {
        count += 1
        that.setData({
          count: count
        })

      }
    }
  },




  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    wx.showLoading({
      title: '数据加载中...',
    })
    //加载上传作品
    var that = this;
    db.collection('menu').get({
      success: function(res) {
        console.log("[数据库查询][用户作品]", res.data)
        that.setData({
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

      },
      fail: console.error,
      complete: function() {
        // console.log("页面加载完毕")
        wx.hideLoading()
      }
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
      // 加载消息
      let mid = this.data.myInfo._id
      let that = this
      db.collection('message').where({
        targetId: mid
      }).get({
        success: function(res) {
          // console.log('消息列表', res.data)
          that.setData({
            messageList: res.data
          })
          that.loadMsg();
        },
        fail: console.error
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