// components/pane/pane.js
Component({
  /**
   * 组件的属性列表
   */
  properties: {
    scrolls: {
      type: Array,
      value: ['关注', '推荐', '家常菜', '烘焙', '小技巧'],
    },
    panes: {
      type: Array,
      value: []
    }
  },

  /**
   * 组件的初始数据
   */
  data: {
    currentId: 0
  },

  /**
   * 组件的方法列表
   */
  methods: {
    //选择标签
    barChange: function(e) {
      let cid = e.detail.currentId;
      // console.log(cid);
      this.setData({
        currentId: cid
      })
    },

    //滑动选择
    swiperChange: function(e) {
      console.log("swiperid", e.detail.current);
      //获取选择器对象
      let bid = this.selectComponent("#barId")
      bid.setBarId(e.detail.current);
      // console.log("bid..."+bid);
    },

  }
})