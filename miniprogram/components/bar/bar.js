// components/bar/bar.js
Component({
  /**
   * 组件的属性列表
   */
  properties: {
    bars: {
      type: Array,
      value: []
    }
  },

  /**
   * 组件的初始数据
   */
  data: {
    current: 0
  },

  /**
   * 组件的方法列表
   */
  methods: {
    //选择标签
    barTap(e) {
      let cid = e.currentTarget.id
      console.log("barid",cid)
      this.setData({
        current: cid
      })
      //触发自定义事件，传递数据
      this.triggerEvent("selectChange", { currentId: cid }, {})
    },
    //获取barid
    setBarId: function (index) {
      this.setData({
        current: index
      })
    },


  }
})