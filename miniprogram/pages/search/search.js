// miniprogram/pages/search/search.js
const db = wx.cloud.database();
Page({

  /**
   * 页面的初始数据
   */
  data: {
    biaoqian: ['菜谱', '推荐', '中餐', '西餐', '烧烤', '烘焙'],
    search: '',
    historys: [],
  },
 
  //搜索内容
  searchInput(e) {
    let search = e.detail.value
    // console.log(search)
    this.setData({
      search: search
    })
  },

  //搜索
  toSearch() {
    let search = this.data.search
    // console.log("用户输入", search)
    search = search.replace(/\s+/g, "");
    if (search != '') {
      wx.showLoading({
        title: '正在搜索中...',
      })
       //数据库搜索
      const command = db.command
      db.collection("menu").where(command.or([ //where中满足对象数组中的任意一个条件即成立
          {
            title: {
              $regex: '.*' + search,
              $options: 'i'
            }
          },
          //模糊匹配title，category字段的内容，option='i'表示不区分大小写
          {
            categorys: {
              $regex: '.*' + search,
              $options: 'i'
            }
          },
          {   //对象数组指定字段的模糊查询条件写法
            'foods.food': {  //foods是评论的对象数组，food是对象的一个字段
              $regex: '.*' + search, //只要foods中任意一个对象的food包含keyword
              $options: 'i'                  //都将满足模糊查询的条件
            }
          }
        ]))
        .get()
        .then(res => {
          console.log("[数据库搜索][用户作品]", res.data)
          wx.hideLoading()
          let count = res.data.length
          // console.log(count)
          var ids = []
          for(let i=0;i<count;i++){
            // console.log(res.data[i]._id)
            let id = res.data[i]._id
            ids.push(id)
          }
          let result = JSON.stringify(ids)
          // console.log(result)
          wx.navigateTo({
            url: '/pages/result/result?result=' + result,
          })
        })
        .catch(err => {
          console.error(err)
        })

      //搜索历史存入缓存
      var historys = this.data.historys.length ? this.data.historys : []
      let index = historys.indexOf(search);
      // console.log("索引", index)
      if (index < 0) {
        historys.unshift(search)
      } else {
        historys.splice(index, 1)
        historys.unshift(search)
      }
      // console.log("historys", historys)
      wx.setStorageSync('historys', historys)
      let history = wx.getStorageSync('historys')
      this.setData({
        historys: history
      })
    } else {
      wx.showToast({
        icon: 'none',
        title: '请输入搜索内容',
      })
    }

  },

  //历史搜索
  clickSearch(e) {
    let search = e.currentTarget.dataset.name
    // console.log(search)
    this.setData({
      search: search
    })
    this.toSearch()
  },

  //清空历史
  clearHistorys() {
    wx.setStorageSync('historys', '')
    let history = wx.getStorageSync('historys')
    this.setData({
      historys: history
    })
  },


  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    let historys = wx.getStorageSync('historys')
    this.setData({
      historys: historys
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