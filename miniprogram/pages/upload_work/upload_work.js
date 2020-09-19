// pages/upload_work/upload_work.js
const db = wx.cloud.database()
const _ = db.command
var DateUtil = require("../../utils/DateUtil.js")
Page({

  /**
   * 页面的初始数据
   */
  data: {
    images: [],
    fileIDs: [],
    show: false,
  },

  //输入标题
  titleInput(e) {
    let title = e.detail.value
    this.setData({
      title: title
    })
  },

  //输入作品感想
  workInput(e) {
    let work = e.detail.value
    this.setData({
      work: work
    })
  },

  /**
   * 上传图片
   */
  upPic: function(evt) {
    //选择图片
    wx.chooseImage({
      count: 9,
      sizeType: ['original', 'compressed'],
      sourceType: ['album', 'camera'],
      success: res => {
        // tempFilePath可以作为img标签的src属性显示图片
        const tempFilePaths = res.tempFilePaths
        // console.log(tempFilePaths);
        this.setData({
          images: this.data.images.concat(tempFilePaths)
        });
        wx.showLoading({
          title: '上传中...',
        })
        //上传到云存储
        for (let i = 0; i < tempFilePaths.length; i++) {
          // console.log("i", tempFilePaths[i]);
          wx.cloud.uploadFile({
            cloudPath: 'food/' + new Date().getTime() + '.png', //上传至云端路径
            filePath: tempFilePaths[i], // 文件路径
            success: res => {
              // get resource ID
              //console.log("fileID", res.fileID);
              this.setData({
                fileIDs: this.data.fileIDs.concat(res.fileID)
              })
            },
            fail: err => {
              console.error(err);
            },
          });
        }
        //关闭等待提示
        wx.hideLoading()
      }
    })
  },

  //预览图片
  showPic(e) {
    let id = e.currentTarget.dataset.id
    let picList = this.data.images
    // console.log(id, picList, picList[id])
    //预览图片
    wx.previewImage({
      current: picList[id], // 当前显示图片的http链接
      urls: picList // 需要预览的图片http链接列表
    })
  },

  //删除图片
  delPic(e) {
    var images = this.data.images;
    let id = e.currentTarget.dataset.id
    // console.log(id)
    images.splice(id, 1)
    this.setData({
      images: images,
    })
  },

  //关联菜谱
  relate() {
    console.log('关联菜谱')
    //跳转到分享作品页面
    wx.navigateTo({
      url: '/pages/records/records'
    })
  },



  //发布作品
  release() {
    console.log('发布作品')
    let info = this.data.info
    let title = this.data.title
    let work = this.data.work
    let imgs = this.data.fileIDs
    if (title == undefined || title == '') {
      wx.showToast({
        icon: 'none',
        title: '标题不能为空',
      })
    } else if (imgs == undefined || imgs == '') {
      wx.showToast({
        icon: 'none',
        title: '图片不能为空',
      })
    } else if (info == undefined || info == '') {
      wx.showToast({
        icon: 'none',
        title: '关联菜谱不能为空',
      })
    } else {
      let id = this.data.info.id
      // 等待提示
      wx.showLoading({
        title: '正在发布中...',
      })
      // 上传作品
      db.collection('work').add({
        data: {
          userId: this.data.myInfo._id,
          upTime: DateUtil.formatTime(new Date()),
          title: title,
          work: work,
          imgs: imgs,
          menuId: id,
          like: 0,
          watch: 0,
        },
        success: function(res) {
          console.log(res)
          wx.showToast({
            title: '发布成功',
            success: function() {
              wx.reLaunch({
                url: '/pages/index/index',
              })
            }
          })
        },
        fail: console.error,
        complete: wx.hideLoading()
      })

    }

  },





  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {

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

    // console.log("晒作品", options)
    if (options.info) {
      var info = JSON.parse(options.info)
      this.setData({
        info: info
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