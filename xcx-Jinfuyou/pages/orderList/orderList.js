// pages/orderList/orderList.js
var gConfig = getApp();
var util = require('../../utils/md5.js');
let i = true;
let k = true;
Page({
  data: { 
    ispaid: true, 
    isfl: true, 
    iskl: true, 
    isnone: true, 
    img: '', 
    imgPath: gConfig.imgHttp,
    sdate:0,
    getRefund: true,
    noshouhuo:true,
    tankuang: true,
    checked:false
    },
  onLoad: function (options) {
    // wx.showLoading({
    //   title: '加载中...',
    // })
    // 页面初始化 options为页面跳转所带来的
    var that = this;
    var wxData = wx.getStorageSync('wxData')
    var isOpenPay = wxData.isOpenPay
    that.setData({
      status: options.status
    })
    if (options.status==0){
      wx.setNavigationBarTitle({ title: "全部订单列表"})
    } else if (options.status == 1){
      wx.setNavigationBarTitle({ title: "待付款订单列表" })
    } else if (options.status == 2) {
      wx.setNavigationBarTitle({ title: "待发货订单列表" })
    } else if (options.status == 3){
      wx.setNavigationBarTitle({ title: "待收货订单列表" }) 
    }
    if (isOpenPay == 1) {
      that.setData({
        isDisplay: true,
        westatus: true,
        unstatus: true,
        allstatus: false
      })
      that.getOrderFn();
    } else {
      that.setData({
        isDisplay: false
      })
    }
  },
  onReady: function () {
    // 页面渲染完成
  },
  onShow: function () {
    // 页面显示
    let that = this;
    that.setData({
      // timeData: [{ time: '三月内', state: 1 }, { time: '今年以内', state: 2 }, { time: '2016年', state: 2016 }, { time: '2015年', state: 2015 }, { time: '2014年', state: 2014 }, { time: '三年前', state: 3 }],
      // paidData: [{ paid: '全部订单', status: 0 }, { paid: '未支付', status: 1 }, { paid: '已支付', status: 2 }],
      time: '三月内',
      payState: '全部订单',
     
      westatus: true,
      unstatus: true,
      allstatus: false
    })
    if (that.data.isDisplay) {
      that.getOrderFn();
    } else {
      that.saveorderFn();
    }
  },
  onHide: function () {
    // 页面隐藏
  },
  onUnload: function () {
    // 页面关闭
  },
  getOrderFn: function (event) {
    
    var that = this;
    var wxData = wx.getStorageSync('wxData');
    var sdate = that.data.sdate;
    var status = that.data.status
    var sign = util.hexMD5('clientId=' + wxData.clientId + '&companyId=' + gConfig.companyId + '&sdate=' + sdate + '&status=' + status + gConfig.key);
    wx.request({
      url: gConfig.http + 'channel/xcx/order/listnew',
      data: {
        companyId: gConfig.companyId,
        clientId: wxData.clientId,
        sdate: sdate,
        status: status,
        sign: sign
      },
      header: {
        'content-type': 'application/json'
      },
      success: function (res) {
        if (res.data.result.code==200){
          var listData = res.data.data;
          if (listData.length > 0) {
            that.setData({
              isnone: true
            })
          } else {
            that.setData({
              isnone: false
            })
          }
          var j;
          for (var i = 0; i < res.data.data.length; i++) {
            for (j = 0; j < res.data.data[i].items.length; j++) {
              res.data.data[i].items[j].price = res.data.data[i].items[j].price.toFixed(2);
            }
            listData[i].amount = listData[i].amount.toFixed(2);
            listData[i].couponDiscount = listData[i].couponDiscount.toFixed(2);
            listData[i].retailPayAmount = listData[i].retailPayAmount.toFixed(2);
            res.data.data[i].items = res.data.data[i].items;
            if (listData[i].couponDiscount) {
              that.setData({
                isMoney: false
              })
            } else {
              that.setData({
                isMoney: true
              })
            }
          }
          if (status == 1) {
            that.setData({
              listData: listData,
              westatus: false
            })
          } else if (status == 2) {
            var skumDfh;
            for (var e = 0; e < listData.length;e++){
              if (listData[e].status == 30) {
                listData[e].skumDfh = '待发货' 
              } else if (listData[e].status == 31){
                listData[e].skumDfh = '备货中'
              }
            }
            that.setData({
              unListData: listData,
              unstatus: false
            })

          } else if(status == 3){
            that.setData({
              unlistreceived: listData,
              noshouhuo: false
            }) 
          } else if (status == 0) {
            var mkstatus;
            for (var k = 0; k < listData.length; k++) {
              if (listData[k].status >= 10 && listData[k].status <= 20 || listData[k].status == 22 || listData[k].status == 23) {
                listData[k].mkstatus = '待付款'
                listData[k].ispo = true
              } else if (listData[k].status == 30) {
                listData[k].mkstatus = '待发货'
                listData[k].ispo = false
                that.setData({
                  getRefund: false
                })
              } else if (listData[k].status >= 40 && listData[k].status <= 99) {
                listData[k].mkstatus = '配送中'
                listData[k].ispo = false
              } else if (listData[k].status == 100) {
                listData[k].mkstatus = '已完成'
                listData[k].ispo = false
              } else if (listData[k].status == -1) {
                listData[k].mkstatus = '已取消'
                listData[k].ispo = false
              } else if (listData[k].status == -4){
                listData[k].mkstatus = '已申请退款'
                listData[k].ispo = false
              } else if (listData[k].status == 31){
                listData[k].mkstatus = '备货中'
                listData[k].ispo = false
                that.setData({
                  getRefund: false
                })
              } else if (listData[k].status == -99){
                listData[k].mkstatus = '超时关闭'
                listData[k].ispo = false
              }
            }
            that.setData({
              allListData: listData
            })
          }
        }         
      }
    })
  },
  //订单点击跳转订单详情页面
  orderDetailFn: function (event) {
    console.log(event)
    var that = this;
    var orderId = event.currentTarget.dataset.orderid;
    var statuscode = event.currentTarget.dataset.statuscode
    wx.navigateTo({
      url: '../orderDetail/orderDetail?orderId=' + orderId + '&status=' + that.data.status + '&statuscode=' + statuscode
    })
  },
  //取消订单
  cancleFn: function (event) {
    var that = this;
    var wxData = wx.getStorageSync('wxData')
    var orderId = event.currentTarget.dataset.orderid;
    if (wxData.isOpenPay == 1) {
      if (that.data.status == 0) {
        var orderList = that.data.allListData
      } else {
        var orderList = that.data.listData;
      }
    } else {
      var orderList = that.data.listData
    }

    var index = {};
    var sign = util.hexMD5('id=' + orderId + gConfig.key);
    for (let i = 0; i < orderList.length; i++) {
      orderList[i].index = i;//闭包
      if (orderList[i].id == orderId) {
        wx.showModal({
          title: '取消提示',
          content: '您确定要取消该订单吗？',
          success: function (res) {
            if (res.confirm) {
              wx.showToast({
                title: '取消成功',
                icon: 'success',
                duration: 1500,
              })
              orderList.splice(orderList[i].index, 1);/*从当前列表删除*/
              /*--重新渲染--*/
              wx.request({
                url: gConfig.http + 'local/xcx/order/del',
                data: { id: orderId, sign: sign },
                header: {
                  'content-type': 'application/json'
                },
                success: function (res) {
                  if (orderList.length > 0) {
                    if (wxData.isOpenPay == 1) {
                      if (that.data.status == 0) {
                        setTimeout(function () {
                          // wx.navigateTo({
                          //   url: '../orderList/orderList?status=0'
                          // })
                           that.setData({
                             status: 0
                           })
                           that.getOrderFn();
                          }, 1500)
                      } else if (that.data.status == 1){
                        setTimeout(function () { that.setData({ listData: orderList }) }, 1500)
                      } 
                    } else {
                      setTimeout(function () { that.setData({ listData: orderList }) }, 1500)
                    }
                  } else {
                    if (wxData.isOpenPay == 1) {
                      if (that.data.status == 0) {
                        setTimeout(function () { that.setData({ allListData: orderList }) }, 1500)
                      } else {
                        setTimeout(function () { that.setData({ listData: orderList, isnone: false }) }, 1500)
                      }
                    } else {
                      setTimeout(function () { that.setData({ listData: orderList, isnone: false }) }, 1500)
                    }
                  }
                }
              })
            }
          }
        })
      }
    }
  },
  placeOrderFn: function (event) {
    // 下单方法
    var that = this;
    var wxData = wx.getStorageSync('wxData');
    var orderId = event.currentTarget.dataset.orderid;
    var sign = util.hexMD5('companyId=' + gConfig.companyId + '&orderId=' + orderId + '&wxOpenid=' + wxData.wxOpenid + gConfig.key);
    wx.request({
      url: gConfig.http + 'channel/xcx/wx/prepardId',
      data: {
        companyId: gConfig.companyId,
        orderId: orderId,
        wxOpenid: wxData.wxOpenid,
        sign: sign
      },
      header: {
        'content-type': 'application/json'
      },
      success: function (res) {
        //微信支付接口
        wx.requestPayment({
          'timeStamp': res.data.data.timeStamp,
          'nonceStr': res.data.data.nonceStr,
          'package': res.data.data.package,
          'signType': 'MD5',
          'paySign': res.data.data.paySign,
          'success': function (res) {
            that.getOrderFn()
          },
          'fail': function (res) {
            that.getOrderFn()
          }
        })
        // 微信支付接口
      }
    })
  },
  // 当商家不支持支付时
  saveorderFn: function (event) {
    var that = this;
    var wxData = wx.getStorageSync('wxData');
    var sign = util.hexMD5('clientId=' + wxData.clientId + '&companyId=' + gConfig.companyId + '&sdate=' + 1 + '&status=' + 1 + gConfig.key);
    wx.request({
      url: gConfig.http + 'channel/xcx/order/list',
      data: {
        clientId: wxData.clientId,
        companyId: gConfig.companyId,
        sdate: 1,
        status: 1,
        sign: sign
      },
      header: {
        'content-type': 'application/json'
      },
      success: function (res) {
        var listData = res.data.data;
        if (listData.length > 0) {
          that.setData({
            isnone: true
          })
        } else {
          that.setData({
            isnone: false
          })
        }
        var j;
        for (var i = 0; i < res.data.data.length; i++) {
          for (j = 0; j < res.data.data[i].items.length; j++) {
            res.data.data[i].items[j].price = res.data.data[i].items[j].price.toFixed(2);
          }
          listData[i].amount = listData[i].amount.toFixed(2);
          listData[i].couponDiscount = listData[i].couponDiscount.toFixed(2);
          listData[i].retailPayAmount = listData[i].retailPayAmount.toFixed(2);
          res.data.data[i].items = res.data.data[i].items;
          if (listData[i].couponDiscount) {
            that.setData({
              isMoney: false
            })
          } else {
            that.setData({
              isMoney: true
            })
          }
        }
        that.setData({
          listData: listData
        })
        for (var i = 0; i < listData.length; i++) {
          var listDataL = listData[i].items;
          
          for (var j = 0; j < listDataL.length; j++) {
            var imgs = gConfig.imgHttp + listDataL[j].img;
            that.setData({
              img: imgs,
            })
          }
        }
      }
    })
  },
  orderFn: function (event) {
    var that = this;
    var that = this;
    var orderId = event.currentTarget.dataset.orderid;
    wx.navigateTo({
      url: '../orderDetail/orderDetail?orderId=' + orderId
    })
  },
  // 退款功能
  tuikuan: function(e){
      var that = this;
      that.setData({
        tankuang: false,
        tkorderId: e.target.dataset.orderid
      }) 

  },
  checkboxChange: function(e){
       var that = this;
       that.setData({
         reason: e.detail.value 
         })
  },
  quxiaoFn: function(){
      var that=this;
      that.setData({
        tankuang: true,
        checked: false,
        reason: ""
      })
  },
  quedingFn: function(){
    var that=this;
    var wxData = wx.getStorageSync('wxData');
    var sign = util.hexMD5('clientId=' + wxData.clientId + '&orderId=' + that.data.tkorderId + '&reason=' + that.data.reason + gConfig.key);
    if (!that.data.reason || that.data.reason==""){
      wx.showToast({
        title: '请选择退款原因',
        icon: 'none',
        duration: 1000,
      })   
    }else{

    
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
       success: function(res){
         if (res.data.result.code == 200) {
           wx.showToast({
             title: '申请退款成功',
             icon: 'success',
             duration: 2000,
             success: function () {
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
  qianshouFn: function(e){
    var that = this;
    var wxData = wx.getStorageSync('wxData');
    var sign = util.hexMD5('clientId=' + wxData.clientId + '&id=' + e.target.dataset.orderid + gConfig.key);
      wx.request({
        url: gConfig.http + 'local/xcx/order/signbyId',
        data: {
          clientId: wxData.clientId, 
          id: e.target.dataset.orderid,
          sign: sign
        },
        success: function(res){
           console.log(res)
           if(res.data.result.code==200){
             wx.showToast({
               title: '签收成功',
               icon: 'success',
               duration: 2000,
               success: function () {
                 that.getOrderFn()
               }
             })
           }
        }
      })
  },
  onShareAppMessage: function () {

  }
})