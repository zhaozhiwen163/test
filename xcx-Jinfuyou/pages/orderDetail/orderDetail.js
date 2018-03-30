// pages/orderDetail/orderDetail.js
var gConfig = getApp();
var util = require('../../utils/md5.js');
Page({
  data: {
    ispaid: true,
    ispaids: true,
    isTui: true,
    isQs: true,
    contactname: '联系方式',
    isonline: true,
    imgPath: gConfig.imgHttp,
    checked: false,
    tankuang: true
  },
  onLoad: function (options) {
    wx.showLoading({
      title: '加载中...',
    })
    console.log(options)
    // 页面初始化 options为页面跳转所带来的参数
    var that = this;
    var wxData = wx.getStorageSync('wxData')
    var isOpenPay = wxData.isOpenPay
    // var isOpenPay = 0;
    if (isOpenPay == 1) {
      if ((options.statuscode >= 10 && options.statuscode <= 23)||options.status==1) {
        that.setData({
          ispaid: false,
          ispaids: false,
          isTui: true,
          isQs: true
        })
      } else if (options.statuscode == 30 || options.statuscode == 31){
        that.setData({
          ispaid: true,
          ispaids: true,
          isTui: false,
          isQs: true,
        })
      } else if (options.statuscode >= 40 && options.statuscode <= 99){
        that.setData({
          ispaid: true,
          ispaids: true,
          isTui: true,
          isQs: false
        })
      } else {
        that.setData({
          ispaid: true,
          ispaids: true,
          isTui: true,
          isQs: true
        })
      }
      that.setData({
        isPay: false,
        orderId: options.orderId,
        status: options.status,
        statuscode: options.statuscode
      })
    } else {
      if (options.status==0){
        that.setData({
          ispaids: true,
          isPay: false
        })
      }else{
        that.setData({
          ispaids: false,
          isPay: true
        })
      }  
      that.setData({
        isonline: false,
        ispaid: true,
        isTui: true,
        orderId: options.orderId
      })
    }
  },
  onReady: function () {
    // 页面渲染完成
  },
  onShow: function () {
   
    // 页面显示
    this.orderDetailFn();
  },
  onHide: function () {
    // 页面隐藏
  },
  onUnload: function () {
    // 页面关闭
  },
  //打电话接口
  phone: function (event) {
    var that = this;
    var orderDetailData = that.data.orderDetailData;
    var mob = orderDetailData.serviceTel;
    wx.makePhoneCall({
      phoneNumber: mob
    })
  },
  // shopDetailFn: function (event) {
  //   var that = this;
  //   var itemId = event.currentTarget.dataset.itemid;
  //   var skuId = event.currentTarget.dataset.skuid;
  //   var itemsData = that.data.itemsData;
  //   var statuscode = that.data.statuscode;
  //   for (var i = 0; i < itemsData.length; i++) {
  //     if (itemsData[i].skuId == skuId) {
  //       if (itemsData[i].isItem == 1) {
  //         if (statuscode.code == 200) {
  //           wx.redirectTo({
  //             url: '../shopDetail/shopDetail?itemId=' + itemId
  //           })
  //         } else {
  //           wx.showToast({
  //             title: '该商品不在本区域展示',
  //             icon: 'success',
  //             duration: 2000
  //           })
  //         }

  //       }
  //     }

  //   }

  // },
  orderDetailFn: function (event) {
    var that = this;
    var orderId = that.data.orderId;
    var sign = util.hexMD5('orderId=' + orderId + gConfig.key);
    wx.request({
      url: gConfig.http + 'channel/xcx/order/detail',
      data: { orderId: orderId, sign: sign },
      header: {
        'content-type': 'application/json'
      },
      success: function (res) {
        wx.hideLoading()
        var orderDetailData = res.data.data;
        var statuscode = res.data.result
        var companyData = res.data.data.company;
        var itemsData = res.data.data.items;
        if (!orderDetailData.contact) {
          that.setData({
            contactname: orderDetailData.contact,
            isContact: false
          })
        } else {
          that.setData({
            contactname: '联系方式 :',
            isContact: true
          })
        }
        var gifts = [];
        for (var i = 0; i < itemsData.length; i++) {
          itemsData[i].price = itemsData[i].price.toFixed(2)
          if (itemsData[i].isItem == 2) {
            gifts.push(itemsData[i])
            itemsData[i].isShop = true
          }
          itemsData[i].img = itemsData[i].img + ".220x220." + (itemsData[i].img.split("."))[1];
        }
        if (gifts.length > 0) {
          that.setData({
            giftData: gifts,
            isGift: false
          })
        } else {
          that.setData({
            isGift: true
          })
        }
        that.setData({
          statuscode: statuscode,
          orderDetailData: orderDetailData,
          companyData: companyData,
          itemsData: itemsData,
        })
        var totalfee = (orderDetailData.amount + orderDetailData.feeAmount - orderDetailData.couponDiscount - orderDetailData.discount).toFixed(2);
        if (orderDetailData.amount < orderDetailData.couponDiscount && orderDetailData.feeAmount != 0) {
          that.setData({
            shopprice: (orderDetailData.amount).toFixed(2),
            foldingfee: (orderDetailData.couponDiscount).toFixed(2),
            freightfee: (orderDetailData.feeAmount).toFixed(2),
            cutfee: (orderDetailData.discount).toFixed(2),
            totalfee: (orderDetailData.feeAmount).toFixed(2),
            timeStamp: orderDetailData.addedTime,
            integral: (orderDetailData.getPoints).toFixed(2)
          })
        } else if (orderDetailData.amount > orderDetailData.couponDiscount) {
          that.setData({
            shopprice: (orderDetailData.amount).toFixed(2),
            cutfee: (orderDetailData.couponDiscount).toFixed(2),
            freightfee: (orderDetailData.feeAmount).toFixed(2),
            foldingfee: (orderDetailData.discount).toFixed(2),
            totalfee: totalfee,
            timeStamp: orderDetailData.addedTime,
            integral: (orderDetailData.getPoints).toFixed(2)
          })
        } else if (orderDetailData.amount < orderDetailData.couponDiscount && orderDetailData.feeAmount == 0) {
          that.setData({
            shopprice: (orderDetailData.amount).toFixed(2),
            cutfee: (orderDetailData.couponDiscount).toFixed(2),
            freightfee: (orderDetailData.feeAmount).toFixed(2),
            foldingfee: (orderDetailData.discount).toFixed(2),
            totalfee: '0.00',
            timeStamp: orderDetailData.addedTime,
            integral: (orderDetailData.getPoints).toFixed(2)
          })
        }


      }
    })
  },
  //取消订单
  cancleFn: function (event) {
    var orderId = event.currentTarget.dataset.orderid;
    var sign = util.hexMD5('id=' + orderId + gConfig.key);
    wx.showModal({
      title: '取消提示',
      content: '您确定要取消该订单吗？',
      success: function (res) {
        if (res.confirm) {
          /*--重新渲染--*/
          wx.request({
            url: gConfig.http + 'local/xcx/order/del',
            data: {
              id: orderId,
              sign: sign
            },
            header: {
              'content-type': 'application/json'
            },
            success: function (res) {
              wx.showToast({
                title: '取消成功',
                icon: 'success',
                duration: 1000
              })
              setTimeout(function () {
                wx.switchTab({
                  url: '../index/index'
                })
              }, 1500)
            }
          })

        }
      }
    })
  },
  placeOrderFn: function (event) {
    // 下单方法
    var that = this;
    var wxData = wx.getStorageSync("wxData")
    var companyId = wx.getStorageSync("sellData").companyId;
    var orderId = event.currentTarget.dataset.orderid;
    // var sign = util.hexMD5('orderId=' + orderId + '&companyId=' + companyId + gConfig.key);
    // wx.request({
    //   url: gConfig.http + 'channel/xcx/wx/prepardId',
    //   data: {
    //     orderId: orderId,
    //     companyId: companyId,
    //     sign: sign
    //   },
      var sign = util.hexMD5('companyId=' + companyId + '&orderId=' + orderId + '&wxOpenid=' + wxData.wxOpenid + gConfig.key);
      wx.request({
        url: gConfig.http + 'channel/xcx/wx/prepardId',
        data: {
          orderId: orderId,
          companyId: companyId,
          wxOpenid: wxData.wxOpenid,
          sign: sign
        },
      header: {
        'content-type': 'application/json'
      },
      success: function (res) {
        // 微信支付接口
        wx.requestPayment({
          'timeStamp': res.data.data.timeStamp,
          'nonceStr': res.data.data.nonceStr,
          'package': res.data.data.package,
          'signType': 'MD5',
          'paySign': res.data.data.paySign,
          'success': function (res) {
            wx.redirectTo({
              url: '../orderList/orderList'
            })
          }
        })
        // 微信支付接口
      }
    })
  },
  // 退款
  placeRefund: function(e){
    var that = this;
    that.setData({
      tankuang: false,
      tkorderId: e.target.dataset.orderid
    })
  },
  // tuikuan: function (e) {
    

  // },
  checkboxChange: function (e) {
    var that = this;
    that.setData({
      reason: e.detail.value
    })
  },
  quxiaoFn: function () {
    var that = this;
    that.setData({
      tankuang: true,
      checked: false,
      reason: ""
    })
  },
  quedingFn: function () {
    var that = this;
    var wxData = wx.getStorageSync('wxData');
    var sign = util.hexMD5('clientId=' + wxData.clientId + '&orderId=' + that.data.tkorderId + '&reason=' + that.data.reason + gConfig.key);
    if (!that.data.reason || that.data.reason=="") {
      wx.showToast({
        title: '请选择退款原因',
        icon: 'none',
        duration: 1000,
      })
    } else {


      wx.request({
        url: gConfig.http + 'common/order/refund',
        data: {
          clientId: wxData.clientId,
          orderId: that.data.tkorderId,
          reason: that.data.reason,
          sign: sign
        },
        header: {
          'content-type': 'application/json'
        },
        success: function (res) {
          if(res.data.result.code==200){
            wx.showToast({
              title: '申请退款成功',
              icon: 'success',
              duration: 2000,
              success:function(){
                that.setData({
                  isTui: true
                })
                wx.navigateTo({
                  url: '../refundList/refundList?status=0'
                })
              } 
            })  
          }
          that.setData({
            tankuang: true,
            checked: false
          })


        }
      })
    }
  },
  // 签收
  qianshouFn: function (e) {
    var that = this;
    var wxData = wx.getStorageSync('wxData');
    var sign = util.hexMD5('clientId=' + wxData.clientId + '&id=' + that.data.orderId + gConfig.key);
    console.log(that.data.orderId)
    wx.request({
      url: gConfig.http + 'local/xcx/order/signbyId',
      data: {
        clientId: wxData.clientId,
        id: that.data.orderId,
        sign: sign
      },
      success: function (res) {
        console.log(res)
        if (res.data.result.code == 200) {
          wx.showToast({
            title: '签收成功',
            icon: 'success',
            duration: 2000,
            success: function () {
                that.setData({
                  isQs: true
                })
                if (that.data.status==0){
                  wx.navigateTo({
                    url: '../orderList/orderList?status=0'
                  })
                }else{
                  wx.navigateTo({
                    url: '../orderList/orderList?status='+that.data.status
                  })
                }
                    
            }
          })
        }
      }
    })
  },
  onShareAppMessage: function () {

  }
})
