// pages/center/center.js
Page({
  data: {},
  onShow: function () {
    // 页面显示
    var that = this;
    var wxData = wx.getStorageSync('wxData');
    that.setData({
      isOpenPay: wxData.isOpenPay
    })
    var searchData = wx.getStorageSync('searchData');
    if (searchData) { wx.removeStorageSync('searchData') };
    that.getSystemInfo();
    that.setData({ isMask: true })
    wx.getUserInfo({
      success: function (res) {
        that.setData({
          avatarUrl: res.userInfo.avatarUrl,
          nickName: res.userInfo.nickName
        })
      }
    })
  },
  getSystemInfo: function () {
    var that = this;
    wx.getSystemInfo({
      success: function (res) {
        that.setData({
          screenheight: (res.windowHeight) * 2 + 'rpx',
          screenwidth: (res.windowWidth) * 2 + 'rpx'
        })
      }
    })
  },
  myAddrListFn: function (e) {
    var that = this;
    that.setData({ isMask: false })
    wx.navigateTo({
      url: '../addrOpt/addrOpt?management=' + true,
    })
  },
  myOrderListFn: function () {
    var that = this;
    that.setData({ isMask: false })
    wx.navigateTo({
      url: '../orderList/orderList?status=0',
    })
  },
  myCouponlistFn: function (event) {
    var that = this;
    that.setData({ isMask: false })
    wx.navigateTo({
      url: '../coupons/coupons?info=' + 'coupon',
    })
  },
  myKefu: function (){
    var that=this;
    that.setData({ isMask: false })
    wx.navigateTo({
      url: '../kefu/kefu',
    })
  },
  myDaiFn: function (){
    var that = this;
    that.setData({ isMask: false })
    wx.navigateTo({
      url: '../orderList/orderList?status=1',
    })
  },
  myDaiFh:function(){
    var that=this;
    wx.navigateTo({
      url: '../orderList/orderList?status=2',
    })
  },
  myDaiSh: function(){
    var that = this;
    wx.navigateTo({
      url: '../orderList/orderList?status=3',
    })
  },
  jinzhiFn:function(){
    wx.showToast({
      title: '不支持微信支付，暂不能查看',
      icon: 'none',
      duration: 2000,
    })
  },
  orderRefund: function(){
    wx.navigateTo({
      url: '../refundList/refundList?status=0',
    }) 
  },
  onShareAppMessage: function () {

  }
})