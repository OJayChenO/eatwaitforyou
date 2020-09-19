// pages/load_caipu/load_caipu.js
var DateUtil = require("../../utils/DateUtil.js")
const db = wx.cloud.database()
Page({

  /**
   * 页面的初始数据
   */
  data: {
    foodList: [{}],
    stepList: [{}, {}, {}],
    showStep: false,
    showFood: false,
    showCat: false,
    categorys: ['菜谱'],
  },



  //上传封面
  upCover() {
    var that = this;
    wx.chooseImage({
      count: 1,
      sizeType: ['original', 'compressed'],
      sourceType: ['album', 'camera'],
      success(res) {
        // tempFilePath可以作为img标签的src属性显示图片
        const tempFilePaths = res.tempFilePaths
        // console.log(tempFilePaths)
        //上传至云存储
        wx.cloud.uploadFile({
          cloudPath: 'food/' + new Date().getTime() + '.png',
          filePath: tempFilePaths[0], // 文件路径
        }).then(res => {
          // get resource ID
          console.log(res.fileID)
          that.setData({
            menuCover: res.fileID,
          })
        }).catch(error => {
          console.log(error)
          // handle error
        })
      }
    })
  },

  //输入标题
  titleInput: function(evt) {
    // console.log(evt.detail.value)
    // let title = evt.detail.value.replace(/\s+/g, "");
    let title = evt.detail.value
    this.setData({
      title: title
    })
  },

  //添加食材
  addFood() {
    var foodList = this.data.foodList;
    var newData = {};
    foodList.push(newData); //实质是添加foodList数组内容，使for循环多一次
    this.setData({
      foodList: foodList,
    })
  },

  //展示调整食材按钮
  showFoodBtn() {
    let showFood = this.data.showFood
    this.setData({
      showFood: !showFood
    });
  },

  //删除食材
  delFood(e) {
    // console.log("删除食材",e)
    var foodList = this.data.foodList;
    let id = e.currentTarget.dataset.id
    // console.log(id)
    foodList.splice(id, 1)
    this.setData({
      foodList: foodList,
    })
  },

  //输入食材
  foodInput(e) {
    // console.log(e)
    // let desc = evt.detail.value.replace(/\s+/g, "");
    // console.log(food)
    // console.log(id)
    let id = e.target.dataset.id
    let food = e.detail.value
    var foodList = this.data.foodList
    let obj = foodList[id]
    obj['id'] = id
    obj['food'] = food
    this.setData({
      foodList: foodList
    })
  },

  //输入用量
  countInput(e) {
    // console.log(e)
    // let count = e.detail.value.replace(/\s+/g, "");
    // console.log(desc)
    // console.log(id)
    let id = e.target.dataset.id
    let count = e.detail.value
    var foodList = this.data.foodList;
    let obj = foodList[id];
    obj['id'] = id;
    obj['count'] = count;
    this.setData({
      foodList: foodList
    })
  },

  //步骤描述
  stepInput(e) {
    // console.log(evt)
    let desc = e.detail.value
    // let desc = e.detail.value.replace(/\s+/g, "");
    // console.log(desc)
    let id = e.target.dataset.id
    // console.log(id)
    var stepList = this.data.stepList
    let obj = stepList[id]
    obj['id'] = id
    obj['desc'] = desc
    this.setData({
      stepList: stepList
    })
  },

  //上传步骤图片
  upImg: function(evt) {
    var that = this;
    // console.log("upImg", evt)
    wx.chooseImage({
      count: 1,
      sizeType: ['original', 'compressed'],
      sourceType: ['album', 'camera'],
      success(res) {
        // tempFilePath可以作为img标签的src属性显示图片
        const tempFilePaths = res.tempFilePaths
        // console.log(tempFilePaths)
        var stepList = that.data.stepList;
        // console.log("lists", lists)
        let id = evt.currentTarget.dataset.id
        let obj = stepList[id];
        //上传至云存储
        wx.cloud.uploadFile({
          cloudPath: 'food/' + new Date().getTime() + '.png',
          filePath: tempFilePaths[0], // 文件路径
        }).then(res => {
          // get resource ID
          console.log(res.fileID)
          obj['img'] = res.fileID
          that.setData({
            stepList: stepList,
          })
        }).catch(error => {
          console.log(error)
          // handle error
        })
      }
    })
  },

  //新增步骤
  addStep() {
    var stepList = this.data.stepList;
    var newData = {};
    stepList.push(newData); //实质是添加lists数组内容，使for循环多一次
    this.setData({
      stepList: stepList,
    })
  },

  //展示调整步骤按钮
  showStepBtn() {
    let showStep = this.data.showStep
    this.setData({
      showStep: !showStep
    });
  },

  //上移步骤
  upMove(e) {
    // console.log("上移步骤",e)
    var stepList = this.data.stepList;
    let id = e.currentTarget.dataset.id
    // console.log(id)
    if (id != 0) {
      stepList[id] = stepList.splice(id - 1, 1, stepList[id])[0] //删除上一个步骤的信息返回给该步骤
      this.setData({
        stepList: stepList,
      })
    } else {
      // lists.push(lists.shift());
      // console.log("已经处于置顶，无法上移")
      wx.showToast({
        icon: 'none',
        title: '已经处于顶部',
      })
    }

  },

  //删除步骤
  delStep(e) {
    // console.log("删除步骤",e)
    var stepList = this.data.stepList;
    let id = e.currentTarget.dataset.id
    // console.log(id)
    stepList.splice(id, 1);
    this.setData({
      stepList: stepList,
    })
  },

  //输入简介
  inputBrief(e) {
    let brief = e.detail.value
    this.setData({
      brief: brief
    })
  },

  //输入总结
  sumInput(e) {
    let sum = e.detail.value
    this.setData({
      sum: sum
    })
  },


  //输入分类
  categoryInput(evt) {
    // let cin = evt.detail.value.replace(/\s+/g, "");
    let category = evt.detail.value
    this.setData({
      category: category
    })

    if (this.data.category != undefined && this.data.category != '') {
      this.setData({
        showCat: true
      })
    } else {
      this.setData({
        showCat: false
      })
    }
  },

  // 输入框聚焦时触发
  categoryFocus() {
    wx.showToast({
      icon: 'none',
      title: '输入分类后点击右方的按钮添加',
    })
  },

  // 输入框失去焦点时触发
  categoryBlur() {
    this.setData({
      showCat: false
    })
  },

  //添加分类
  addCategory() {
    let category = this.data.category
    let categorys = this.data.categorys
    if (category == undefined || category == '') {
      wx.showToast({
        icon: 'none',
        title: '分类不能为空',
      })
    } else {
      categorys.push(category)
      this.setData({
        categorys: categorys
      })
    }
  },

  //删除分类
  delCategory(evt) {
    // console.log(evt);
    let id = evt.target.dataset.id
    // console.log(id)
    let categorys = this.data.categorys;
    categorys.splice(id, 1);
    // console.log(category) 
    this.setData({
      categorys: categorys
    })
  },

  //上传作品
  upload: function() {
    let title = this.data.title
    let menuCover = this.data.menuCover
    var foodList = this.data.foodList
    var stepList = this.data.stepList
    var categorys = this.data.categorys
    //判断食材是否为空
    function checkFood() {
      let i, food, count;
      for (i = 0; i < foodList.length; i++) {
        food = foodList[i].food
        count = foodList[i].count
        if (food == undefined || food == '') {
          console.log("食材为空")
          return true;
        }
        if (count == undefined || count == '') {
          console.log("用量为空")
          return true;
        }
      }
      return false;
    }
    //判断步骤是否为空
    function checkDesc() {
      let i, desc;
      for (i = 0; i < stepList.length; i++) {
        desc = stepList[i].desc
        if (desc == undefined || desc == '') {
          // console.log("步骤描述为空")
          return true;
        }
      }
      return false;
    }

    if (menuCover == undefined) {
      wx.showToast({
        icon: 'none',
        title: '封面不能为空',
      })
    } else if (title == undefined || title == '') {
      wx.showToast({
        icon: 'none',
        title: '标题不能为空',
      })
    } else if (checkFood()) {
      wx.showToast({
        icon: 'none',
        title: '食材和用量不能为空',
      })
    } else if (checkDesc()) {
      wx.showToast({
        icon: 'none',
        title: '步骤描述不能为空',
      })
    } else if (foodList.length < 1) {
      wx.showToast({
        icon: 'none',
        title: '食材至少1项',
      })
    } else if (stepList.length < 3) {
      wx.showToast({
        icon: 'none',
        title: '步骤至少3项',
      })
    } else {
      wx.showLoading({
        title: '正在发布中...',
      })
      db.collection('menu').add({
        // data 字段表示需新增的 JSON 数据
        data: {
          userId: this.data.myInfo._id,
          upTime: DateUtil.formatTime(new Date()),
          title: this.data.title,
          steps: this.data.stepList,
          foods: this.data.foodList,
          categorys: this.data.categorys,
          menuCover: this.data.menuCover,
          brief: this.data.brief,
          sum: this.data.sum,
          like: 0,
          watch: 0,
          collect:0,
        },
        success: function(res) {
          // res 是一个对象，其中有 _id 字段标记刚创建的记录的 id
          console.log(res)
          wx.showToast({
            title: '上传成功',
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