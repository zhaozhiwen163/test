// pages/shoppingcar/shoppingcar.js
var gConfig = getApp();
var util = require('../../utils/md5.js');
var delData = [];
Page({
  data: {
    totalPrice: 0,
    isOrder: true,
    img: '',
    imgPath: gConfig.imgHttp,
  },
  onShow: function () {
    // 页面显示 
    var that = this;
    var images = [];
    var searchData = wx.getStorageSync('searchData');
    wx.setStorageSync('sig', '');
    if (searchData) { wx.removeStorageSync('searchData') }
    var shoppingcarData = wx.getStorageSync('shoppingcarData');
    if (shoppingcarData.length > 0) {
      for (var i = 0; i < shoppingcarData.length; i++) {
        if (shoppingcarData[i].moq == 0 ){
          shoppingcarData[i].moq = 1 
        }
       
        
        var img = (shoppingcarData[i].goodsImg.split('.'))[0] + '.' + (shoppingcarData[i].goodsImg.split('.'))[1] + '.400x400.' + (shoppingcarData[i].goodsImg.split('.'))[1];
        images.push(gConfig.imgHttp + img)
        for(var j = 0; j<images.length; j++){
          that.setData({
            img: images[j],
          })
        }
        
      }
      that.setData({
        orderData: shoppingcarData,
        isOrder: false,
        isNone: false,
        img: images[j]
      })
    } else {
      that.setData({
        orderData: [],
        isOrder: true,
        isNone: true
      })
    }
    /*--求和--*/
    that.sumcalcFn();

  },
  noneFn: function (event) {
    wx.switchTab({
      url: '../index/index',
    })
  },
  settlementFn: function () {
    var that = this;
    wx.removeStorageSync('addressData')
    that.setData({ isOrder: true });
    var orderData = that.data.orderData;
    wx.setStorageSync('sig', true);
    wx.setStorage({
      key: "orderData",
      data: orderData
    })
    wx.navigateTo({
      url: '../orderConfirm/orderConfirm',
    })
  },
  goodsNumFn: function (event) {
    var that = this;
    var shoppingData = that.data.orderData
    var id = event.currentTarget.dataset.id;
    var priceDetail=Number(event.detail.value);
    for (var i = 0; i < shoppingData.length; i++) {
      if (shoppingData[i].skuId == id) {
        if (shoppingData[i].qty) {
          if (priceDetail == "" || priceDetail < (shoppingData[i].qty)) {
            shoppingData[i].moq = shoppingData[i].qty
          } else if (priceDetail >= 9999) {
            shoppingData[i].moq = 9999
          } else {
            shoppingData[i].moq = priceDetail
          }
        } else {
          if (priceDetail == "" || priceDetail <= 1) {
            shoppingData[i].moq = 1
          } else if (priceDetail >= 9999) {
            shoppingData[i].moq = 9999
          } else {
            shoppingData[i].moq = priceDetail
          }
        }
        that.setData({
          orderData: shoppingData
        })
        wx.setStorageSync('orderData', shoppingData);
        wx.setStorageSync('shoppingcarData', shoppingData)
        that.sumcalcFn();
      }
    }
  },
  decrFn: function (event) {
    /*--产品数量-1--*/
    var that = this;
    var cartid = event.currentTarget.dataset.cartid;
    var goodslist = that.data.orderData;
    for (var i = 0; i < goodslist.length; i++) {
      if (goodslist[i].skuId == cartid) {
        if (goodslist[i].qty) {
          if ((goodslist[i].moq - 1) < goodslist[i].qty) {
            goodslist[i].moq = goodslist[i].qty;
          } else {
            goodslist[i].moq = parseInt(goodslist[i].moq) - 1
          }
        } else {
          if ((goodslist[i].moq - 1) < 1) {
            goodslist[i].moq = 1;
          } else {
            goodslist[i].moq = parseInt(goodslist[i].moq) - 1
          }
        }
      }
    }
    /*--重新渲染--*/
    that.setData({
      orderData: goodslist,
    })
    wx.setStorage({
      key: "shoppingcarData",
      data: goodslist
    })
    /*--求和--*/
    that.sumcalcFn();

  },
  incrFn: function (event) {
    /*--产品数量+1--*/
    var that = this;
    var cartid = event.currentTarget.dataset.cartid;
    var goodslist = that.data.orderData;
    for (var i = 0; i < goodslist.length; i++) {
      if (goodslist[i].skuId == cartid) {
        if ((goodslist[i].moq + 1) > 9999) {
          goodslist[i].moq = 9999;
        } else {
          goodslist[i].moq = parseInt(goodslist[i].moq) + 1
        }
      }
    }
    /*--重新渲染--*/
    that.setData({
      orderData: goodslist,
    })
    wx.setStorage({
      key: "shoppingcarData",
      data: goodslist
    })
    /*--求和--*/
    that.sumcalcFn();

  },
  sumcalcFn: function () {
    /*--订单求和--*/
    var sumcalc = 0;
    var that = this;
    var goodslist = that.data.orderData;
    for (var i = 0; i < goodslist.length; i++) {
      var price = parseInt(goodslist[i].moq) * ((goodslist[i].shopprice));
      sumcalc += price;
    }
    /*--重新渲染--*/
    that.setData({
      totalPrice: sumcalc.toFixed(2),
    })
  },
  removeFn: function (event) {
    /*--删除订单--*/
    var that = this;
    var cartid = event.currentTarget.dataset.cartid;
    var goodslist = that.data.orderData;
    var index = {};
    for (let i = 0; i < goodslist.length; i++) {
      goodslist[i].index = i;//闭包
      if (goodslist[i].skuId == cartid) {
        wx.showModal({
          title: '删除提示',
          content: '您确定要删除该商品吗？',
          success: function (res) {
            if (res.confirm) {
              delData.push({
                'id': goodslist[i].id
              });
              wx.setStorageSync('delData', delData);
              goodslist.splice(goodslist[i].index, 1);/*从当前列表删除*/
              if (goodslist.length > 0) {
                that.setData({
                  orderData: goodslist,
                  isOrder: false
                })
              } else {
                that.setData({
                  orderData: goodslist,
                  isOrder: true
                })
              }
              /*--重新渲染--*/
              wx.setStorage({
                key: "shoppingcarData",
                data: goodslist
              })
            } else {
              that.setData({
                orderData: goodslist,
                isOrder: false
              })
            }
            /*--订单求和--*/
            that.sumcalcFn();
          }
        })
      }
    }
  },
  onShareAppMessage: function () {

  }
})