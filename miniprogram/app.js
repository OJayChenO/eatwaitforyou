//app.js
App({
  onLaunch: function() {

    if (!wx.cloud) {
      console.error('请使用 2.2.3 或以上的基础库以使用云能力')
    } else {
      wx.cloud.init({
        // env 参数说明：
        //   env 参数决定接下来小程序发起的云开发调用（wx.cloud.xxx）会默认请求到哪个云环境的资源
        //   此处请填入环境 ID, 环境 ID 可打开云控制台查看
        //   如不填则使用默认环境（第一个创建的环境）
        // env: 'my-env-id',
        traceUser: true,
      })
    }

    this.globalData = {}

    /**
     * 打开小程序的时候首先获得用户openid
     */
    wx.cloud.callFunction({
      name: 'login',
      data: {},
      success: res => {
        // console.log(res)
        this.globalData.openid = res.result.openid
      },
      fail: err => {
        console.error('[云函数] [login] 调用失败', err)
      }
    })

    //判断登录状态
    var expiration = wx.getStorageSync("expiration"); //拿到过期时间
    if (expiration) {
      // console.log("过期时间", expiration)
      var timestamp = Date.parse(new Date()); //拿到现在时间
      //进行时间比较
      if (expiration < timestamp) { //过期了，清空缓存
        wx.showModal({
          title: '登录已过期',
          content: '请重新登录',
          showCancel: false,
          success: function() {
            wx.clearStorageSync(); //清空缓存
            wx.reLaunch({
              url: '/pages/index/index',
            })
          },
        })
      }
    }

  }
})