// pages/orderConfirm/orderConfirm.js
var gConfig = getApp();
var util = require('../../utils/md5.js');
Page({
  data: {
    isDisplay: true,
    value: '请选择收货地址',
    isSaveFn: "placeOrderFn",
    gray: "",
    img: '',
    isWxpayFn:'wxpay'
  },
  onLoad: function (options) {
    this.setData({ 
      isDisplay: false, 
      isGift: true, 
      iscoupon: true,
    })
  },
  onShow: function () {
    // 页面显示
    var that = this;
    var searchData = wx.getStorageSync('searchData');
    if (searchData) { wx.removeStorageSync('searchData') }
    var sellData = wx.getStorageSync('sellData')
    var wxData = wx.getStorageSync('wxData')
    var orderData = wx.getStorageSync('orderData')
    var isOpenPay = wxData.isOpenPay
    // var isOpenPay = 0
    var isShow, isDisplay;
    if (isOpenPay == 1) {
      isShow = true;
      isDisplay = false;
    } else {
      isShow = false;
      isDisplay = true;
    }
    that.setData({
      isShow: isShow,
      isDisplay: isDisplay,
      isGift: true,
      orderData: orderData
    })
    that.addressChoiceFn();
  },
  onHide: function () {
    // 页面隐藏
  },
  onUnload: function () {
    // 页面关闭
  },
  
  //收货地址选择
  addrOptFn: function (event) {
    var that = this;
    wx.navigateTo({
      url: '../addrOpt/addrOpt',
    })
  },
  addressChoiceFn: function (event) {
    var that = this;
    that.setData({
      value: '请选择收货地址',
      mobile: '',
      name:''
    })
    var addressData = wx.getStorageSync('addressData');
    if (addressData) {
      //当地址自己选择时
      that.setData({
        value: addressData.value,
        mobile: addressData.mobile,
        name: addressData.consignee,
        id: addressData.id,
        region: addressData.region,
        isname: false,
        regionAddress: addressData.regionAddress
      })
      that.shoppriceDetailFn();
    } else {
      //获取默认地址
      that.setDefaultAddrFn();
    }
  },
  //优惠劵的选择
  couponchoiceFn: function (event) {
    var that = this;
    var order = that.data.order;
    var coupon = that.data.coupon;
    var couponinfo = that.data.couponinfo;
    wx.setStorageSync('coupon', coupon)
    if (couponinfo.length > 0) {
      if (order) {
        wx.navigateTo({
          url: '../coupons/coupons?order=' + 'name'
        })
      } else {
        wx.navigateTo({
          url: '../coupons/coupons'
        })
      }
    } else {
      wx.showToast({
        title: '暂无可用优惠劵',
        icon: 'faild',
        duration: 2000,
        mask: true
      })
    }

  },
  //每种商品的不同总价
  totalFn: function (event) {
    var that = this;
    var price = Number(that.data.shopprice);
    var freightfee = Number(that.data.freightfee)
    var foldingfee = Number(that.data.foldingfee);
    var coupon = Number(that.data.cutfee);
    var realfee = (price + freightfee - coupon - foldingfee).toFixed(2);
    if (coupon < price) {
      that.setData({
        realfee: realfee
      })
    } else if (coupon >= price && freightfee == 0) {
      that.setData({
        realfee: '0.00'
      })
    } else if (coupon >= price && freightfee != 0) {
      that.setData({
        realfee: freightfee.toFixed(2)
      })
    }
  },
  wxpay: function () {
    // 下单方法
    var that = this;
   
    var orderInfoData = that.data.items;
    var shopGift = that.data.shopGift;
    var coupons = that.data.coupons;
    var foldingfee = Number(that.data.foldingfee);
    var wxData = wx.getStorageSync('wxData');
    var couponData = wx.getStorageSync('couponData')
    var order = that.data.order;
    var companyData = wx.getStorageSync('sellData');
    var addressData = wx.getStorageSync('addressData');
    var regionDetail = that.data.region
    if (regionDetail) {
      var regionAddress = regionDetail;
    } else {
      var regionAddress = ''
    }
    if (wxData.region == 0) {
      var region = companyData.region;
    } else {
      var region = wxData.region;
    }
    if (addressData) {
      var regionAddress = addressData.region
    }
    let itemCarts = {};
    let items = {};
    let orderGiftMap = {};
    // var code;
    // for (var i = 0; i < orderInfoData.length; i++) {
    //   var companyId = orderInfoData[i].companyId
    //   if (coupons.length > 0) {
    //     if (that.data.kl == 1) {
    //       code = 0
    //     } else {
    //       if (couponData) {
    //         code = couponData.code
    //       } else {
    //         code = coupons[0].code
    //       }
    //     }
    //   } else {
    //     code = 0
    //   }
    // }
    for (let j = 0; j < orderInfoData.length; j++) {
      var companyId = wxData.companyId
      let ncompanyId = `N${companyId}`;
      itemCarts[ncompanyId] = {
        "clientId": wxData.clientId,
        "couponId": that.data.couponIdd,
        "companyId": gConfig.companyId,
        "items": items,
        "key": "N" + gConfig.companyId,
        "orderGiftMap": orderGiftMap,
        "region": region,
        "regionAddress": regionAddress
      }
      items[orderInfoData[j].skuId] = {
        id: orderInfoData[j].skuId,
        qty: orderInfoData[j].qty,
      }
      for (var k = 0; k < shopGift.length; k++) {
        orderGiftMap[shopGift[k].id] = {
          id: shopGift[k].id,
          qty: shopGift[k].qty,
        }
      }
    }
    wx.removeStorageSync('couponData')
    if (that.data.mobile) {
      that.setData({
        isWxpayFn: ''
      })
      wx.request({
        url: gConfig.http + 'channel/xcx/order/save',
        data: {
          data: {
            "appId": gConfig.appId,
            "buyer": wxData.clientId,
            'discount': foldingfee,
            "clientAddrId": that.data.id,
            "companyId": gConfig.companyId,
            itemCarts,
            "logisticsId": 0,
            "orderSource": 3,
            "payMode": 1,
            "seller": wxData.companyId,
            "region": region,
            "wxOpenid": wxData.wxOpenid
          }
        },
        header: {
          'content-type': 'application/json'
        },
        success: function (res) {
           
          wx.setStorageSync('shoppingcarData', [])
          // 微信支付接口
          wx.requestPayment({
            'timeStamp': res.data.data.timeStamp,
            'nonceStr': res.data.data.nonceStr,
            'package': res.data.data.package,
            'signType': 'MD5',
            'paySign': res.data.data.paySign,
            'success': function (res) {
              wx.redirectTo({
                url: '../orderList/orderList?status=0',
              })
            },
            'fail': function (res) {
              wx.redirectTo({
                url: '../orderList/orderList?status=0',
              })
            }
          })
          // 微信支付接口
        },
      })
      wx.redirectTo({
        url: '../index/index',
      })
    } else {
      wx.showToast({
        title: '请填写收货地址',
        icon: 'loading',
        duration: 1000
      })
    }
  },
  //当地址列表存储的数据为空时执行以下方法
  setDefaultAddrFn: function () {
    var that = this;
    var companyData = wx.getStorageSync('sellData');
    var wxData = wx.getStorageSync('wxData');
    var sign = util.hexMD5('clientId=' + wxData.clientId + gConfig.key);
    wx.request({
      url: gConfig.http + 'address/list',
      data: {
        clientId: wxData.clientId,
        sign: sign
      },
      header: {
        'content-type': 'application/json'
      },
      success: function (res) {
        var addrList = res.data.data.list;
        if (addrList.length > 0) {
          for (var i = 0; i < addrList.length; i++) {
            if (addrList[i].isDefault == 1) {
              that.setData({
                value: addrList[i].regionName + addrList[i].address,
                mobile: addrList[i].mob,
                name: addrList[i].consignee,
                id: addrList[i].id,
                region: addrList[i].region,
                isname: false
              }) 
            }
          }
          that.regionFn();
        } else {
          that.setData({
            isname: true,
            value: "请选择收货地址"
          })

          that.shoppriceDetailFn();
        }
      }
    })

  },
  regionFn: function (event) {
    var that = this;
    var regionDetail = that.data.region;
    that.setData({
      region: regionDetail
    })
    that.shoppriceDetailFn();
  },
  //当商家不支持线上支付时，那么就执行以下方法
  placeOrderFn: function (event) {
    var that = this;
    var sig = wx.getStorageSync('sig');
    var orderInfoData = that.data.items;
    var shopGift = that.data.shopGift;
    var foldingfee = Number(that.data.foldingfee);
    var coupons = that.data.coupons;
    var wxData = wx.getStorageSync('wxData');
    var couponData = wx.getStorageSync('couponData')
    var order = that.data.order;
    var companyData = wx.getStorageSync('sellData');
    var addressData = wx.getStorageSync('addressData');
    var regionDetail = that.data.region
    if (regionDetail) {
      var regionAddress = regionDetail;
    } else {
      var regionAddress = ''
    }
    if (wxData.region == 0) {
      var region = companyData.region;
    } else {
      var region = wxData.region;
    }
    if (addressData) {
      var regionAddress = addressData.region
    }
    let itemCarts = {};
    let itemCarts1 = {};
    let items = {};
    let orderGiftMap = {};
    var couponId;
    for (var i = 0; i < orderInfoData.length; i++) {
      var companyId = orderInfoData[i].companyId
      if (coupons.length > 0) {
        if (couponData.length > 0) {
          couponId = couponData[0].couponId
        } else {
          couponId = coupons[0].couponId;
        }
      } else {
        couponId = 0;
      }
    }
    let ncompanyId;
    for (let j = 0; j < orderInfoData.length; j++) {
      var couponId = wx.getStorageSync('couponId');
      var companyId = wxData.companyId
      ncompanyId = `N${companyId}`;
      itemCarts[ncompanyId] = {
        "clientId": wxData.clientId,
        "companyId": companyId,
        "couponId": couponId,
        "items": items,
        "key": "N" + companyId,
        "orderGiftMap": orderGiftMap,
        "region": region,
        "regionAddress": regionDetail
      }
      // wx.setStorageSync('couponId',0)//修改
      items[orderInfoData[j].skuId] = {
        id: orderInfoData[j].skuId,
        qty: orderInfoData[j].qty,
      }
      for (var k = 0; k < shopGift.length; k++) {
        orderGiftMap[shopGift[k].id] = {
          id: shopGift[k].id,
          qty: shopGift[k].qty,
        }
      }
      
    }
    wx.removeStorageSync('couponData')
    if (that.data.mobile) {
      wx.request({
        url: gConfig.http + 'channel/xcx/order/save',
        data: {
          data: {
            "appId": gConfig.appId,
            'discount': foldingfee,
            "clientAddrId": that.data.id,
            "buyer": wxData.clientId,
            "companyId": companyData.companyId,      
            itemCarts,
            "logisticsId": 0,
            "orderSource": 3,
            "payMode": 1,
            "seller": companyData.companyId,
            "seller": wxData.companyId,
            "region": region
          }
        },
        header: {
          'content-type': 'application/json'
        },
        success: function (res) {
          var result = res.data.result;
          if (result.code == 200) {
            wx.showToast({
              title: '提交成功',
              icon: 'success',
              duration: 1500
            })
            wx.redirectTo({
              url: '../orderList/orderList?status=0'
            })
            wx.setStorageSync('couponId',0);
            if (sig == true) {
              wx.setStorageSync('shoppingcarData', [])
            }
          } else if (result.code == -1){
            // that.couponFn2();
            // that.shoppriceDetailFn();
            itemCarts[ncompanyId].couponId = "";
            wx.showModal({
              title: '温馨提示',
              content: result.message,
              success: function (res) {
                if (res.confirm) {
                  wx.request({
                    url: gConfig.http + 'channel/xcx/order/save',
                    data: {
                      data: {
                        "appId": gConfig.appId,
                        'discount': foldingfee,
                        "clientAddrId": that.data.id,
                        "buyer": wxData.clientId,
                        "companyId": companyData.companyId,
                        itemCarts,
                        "logisticsId": 0,
                        "orderSource": 3,
                        "payMode": 1,
                        "seller": companyData.companyId,
                        "seller": wxData.companyId,
                        "region": region
                      }
                    },
                    header: {
                      'content-type': 'application/json'
                    },
                    success: function (res) {
                      wx.showToast({
                        title: '提交成功',
                        icon: 'success',
                        duration: 1500
                      })
                      if (sig == true) {
                        wx.setStorageSync('shoppingcarData', [])
                      }
                      wx.redirectTo({
                        url: '../orderList/orderList?status=0'
                      })
                    }
                  })                  
                } else if (res.cancel) {
                  
                }
              }
            })
          }else if(that.data.value=="请选择收货地址"){
            wx.showToast({
              title: '请填写收货地址',
              icon: 'loading',
              duration: 1000
            })
          } else{
            wx.showToast({
              title: '提交成功',
              icon: 'success',
              duration: 1000
            })
            setTimeout(function () { wx.redirectTo({ url: '../orderList/orderList?status=0' }) }, 1500)
            
              
          }

        }
      })
    } else {
      wx.showToast({
        title: '请填写收货地址',
        icon: 'loading',
        duration: 1000
      })
    }

  },
  
  //获取买家所花费具体金额的方法
  shoppriceDetailFn: function (event) {
    var that = this;
    var orderInfoData = wx.getStorageSync('orderData');
    var sellData = wx.getStorageSync('sellData');
    var wxData = wx.getStorageSync('wxData')
    var addressData = wx.getStorageSync('addressData')
    var regionDetail = that.data.region;
    if (wxData.region == 0) {
      var region = sellData.region;
      var regionAddress = regionDetail
    } else {
      var region = wxData.region;
      var regionAddress = regionDetail
    }
    if (addressData) {
      var regionAddress = addressData.region;
    } else {
      var regionAddress = regionDetail
    }
    let data = {};
    let items = {};
    // var sign = util.hexMD5('clientId=' + wxData.clientId + '&companyId=' + companyId + '&items=' + items + '&region=' + region + '&regionAddress=' + regionAddress + gConfig.key);
    for (let j = 0; j < orderInfoData.length; j++) {
      var sign1 = util.hexMD5('data' + data[ncompanyId] + gConfig.key);
      var companyId = orderInfoData[j].companyId
      let ncompanyId = `N${companyId}`;
      data[ncompanyId] = {
        clientId: wxData.clientId,
        companyId: companyId,
        items: items,
        region: region,
        regionAddress: regionAddress
      }
      items[orderInfoData[j].skuId] = {
        id: orderInfoData[j].skuId,
        qty: orderInfoData[j].moq  
      }
    }
    wx.request({
      url: gConfig.http + 'channel/xcx/order/amount',
      data: {
        data
      },
      header: {
        'content-type': 'application/json'
      },
      success: function (res) {
        var goodsData = res.data.data;
        var sumtotal = 0;
        var sumfreight = 0;
        var promotionDiscount = 0;
        var items = goodsData[0].items;
        // var coupon = goodsData[0].coupon;
        // var couponId = goodsData[0].coupon.id;
        // wx.setStorageSync('couponId', couponId)
        var orderGifts = [];
        var couponinfo = [];
        var images = [];
        var couponData = wx.getStorageSync('couponData');
        var orderData = wx.getStorageInfoSync('orderData');
        for(var i = 0; i<items.length; i++){
          items[i].price=items[i].price.toFixed(2);
          var imgs =(items[i].img.split('.'))[0] + '.' + (items[i].img.split('.'))[1] + '.220x220.' + (items[i].img.split('.'))[1];
          images.push(gConfig.imgHttp +imgs)
          // for(var j = 0; j<images.length; j++){
            // that.setData({
            //   img: images,
            // })
          // }
          
        }
        // res.data.data[0].coupon ? res.data.data[0].coupon.id : 0
        that.setData({
          img: images,
          couponIdd: res.data.data[0].coupon ? res.data.data[0].coupon.id : 0
        })
        for (var z = 0; z < goodsData.length; z++) {
          sumtotal += goodsData[z].total;
          sumfreight += goodsData[z].freight;
          promotionDiscount += goodsData[z].promotionDiscount;
          var orderGifts = orderGifts.concat(goodsData[z].orderGifts);
          var couponinfo = couponinfo.concat(goodsData[z].coupons)
        }
        // for (var j = 0; j < items.length; j++) {
        //   items[j].price = items[j].price.toFixed(2);
        //   if (res.data.data[0].serviceArea == 0){
        //     items[j].tipTxt = '该商品不在服务区域';
        //   }else{
        //     if (items[j].isRegionSale == 0) {
        //       items[j].tipTxt = '该商品不在本地销售';
        //       items[j].gray = "gray";
        //     } else {
        //       items[j].tipTxt = '';
        //       items[j].gray = "";
        //     }
        //   }
          
        // }
        that.setData({
          isSaveFn: "placeOrderFn",
          isWxpayFn: 'wxpay'      
        })
        // if (res.data.data[0].serviceArea == 0){
        //   that.setData({
        //     isSaveFn: "saveTipFn3",
        //     isWxpayFn: 'saveTipFn3'        
        //   })

        // }else{
        //   for (var n = 0; n < items.length; n++) {
        //     if (items[n].isRegionSale == 0) {
        //       that.setData({
        //         isSaveFn: "saveTipFn",
        //         isWxpayFn: 'saveTipFn'       
        //       })
        //     }
        //   }
        // }
        if (!orderGifts.length > 0) {
          that.setData({
            isGift: true
          })
        } else {
          for (var i = 0; i < orderGifts.length; i++) {
            that.setData({
              isGift: false,
              giftData: orderGifts
            })
          }
        }
        // if (regionDetail) {
          var freightfeeDetail = sumfreight;
        // } else {
        //   var freightfeeDetail = 0;
        // }
        var shopGift = orderGifts;
        that.setData({
          items: items,
          coupons: {},//couponinfo,
          shopGift: shopGift,
          foldingfee: promotionDiscount.toFixed(2),
          shopprice: (sumtotal).toFixed(2),
          freightfee: freightfeeDetail.toFixed(2),
          couponinfo: couponinfo,
          integral: Math.floor(goodsData[0].getPoints).toFixed(2),
        })
        // that.couponFn();
        if (goodsData[0].coupon == null ){
          var couponinfo = that.data.coupons;
          var couponData = wx.getStorageSync('couponData')
          that.setData({
            cutfee: '0.00',
            iscoupon: true,
            coupontxt: '暂无可用优惠劵！'
          })
          that.totalFn();
        }else{
          var couponinfo = that.data.coupons;
          var couponData = wx.getStorageSync('couponData')
          var coupon = goodsData[0].coupon;
          var couponId = goodsData[0].coupon.id;
          wx.setStorageSync('couponId', couponId)
            if (couponId) {
              that.setData({
                cutfee: coupon.discount.toFixed(2),
                discount: coupon.discount.toFixed(2),
                iscoupon: false
              })
            } else {
              that.setData({
                cutfee: '0.00',
                iscoupon: true,
                coupontxt: '暂无可用优惠劵！'
              })
            }
            // wx.setStorageSync('couponId', 0)//修改
          that.totalFn();
        }

      },
      fail: function (res) {
        that.setData({
          iscoupon: true
        })
      }
    })
  },
  // saveTipFn:function(){
  //   wx.showModal({
  //     title: '温馨提示',
  //     content: '订单含有非本地销售商品，请修改您的订单'
  //   })
  // },
  // saveTipFn3: function () {
  //   wx.showModal({
  //     title: '温馨提示',
  //     content: '该商品不在服务区域'
  //   })
  // },
  onShareAppMessage: function () {

  }
  // couponFn: function (event) {
  //   var that = this;
  //   var couponinfo = that.data.coupons;
  //   var couponData = wx.getStorageSync('couponData')
  //   if (couponinfo.length > 0) {
  //     if (couponData) {
  //       that.setData({
  //         cutfee: (couponData.discount).toFixed(2),
  //         discount: couponData.discount,
  //         iscoupon: false
  //       })
  //     } else {
  //       if (that.data.kl == 1) {
  //         that.setData({
  //           iscoupon: true,
  //           cutfee: '0.00',
  //           coupontxt: '优惠劵未使用！'
  //         })
  //       } else {
  //         that.setData({
  //           cutfee: (couponinfo[0].discount).toFixed(2),
  //           discount: couponinfo[0].discount,
  //           iscoupon: false,
  //         })
  //       }
  //     }
  //   } else {
  //     that.setData({
  //       cutfee: '0.00',
  //       iscoupon: true,
  //       coupontxt: '暂无可用优惠劵！'
  //     })
  //   }
  //   that.totalFn();
  // },

  // couponFn2: function(event){
  //   if (goodsData[0].coupon == null ){
  //         var couponinfo = that.data.coupons;
  //         var couponData = wx.getStorageSync('couponData')
  //         if (couponinfo.length > 0) {
  //           if (couponData) {
  //             that.setData({
  //               cutfee: (couponData.discount).toFixed(2),
  //               discount: couponData.discount,
  //               iscoupon: false
  //             })
  //           } else {
  //             if (that.data.kl == 1) {
  //               that.setData({
  //                 iscoupon: true,
  //                 cutfee: '0.00',
  //                 coupontxt: '优惠劵未使用！'
  //               })
  //             } else {
  //               that.setData({
  //                 cutfee: (couponinfo[0].discount).toFixed(2),
  //                 discount: couponinfo[0].discount,
  //                 iscoupon: false,
  //               })
  //             }
  //           }
  //         } else {
  //           that.setData({
  //             cutfee: '0.00',
  //             iscoupon: true,
  //             coupontxt: '暂无可用优惠劵！'
  //           })
  //         }
  //         that.totalFn();
  //       }else{
  //         var couponinfo = that.data.coupons;
  //         var couponData = wx.getStorageSync('couponData')
  //         var coupon = goodsData[0].coupon;
  //         var couponId = goodsData[0].coupon.id;
  //         wx.setStorageSync('couponId', couponId)
  //         if (couponId){
  //           if (couponinfo.length > 0) {
  //             if (couponData) {
  //               that.setData({
  //                 cutfee: (couponData.discount).toFixed(2),
  //                 discount: couponData.discount,
  //                 iscoupon: false
  //               })
  //             } else {
  //               if (that.data.kl == 1) {
  //                 that.setData({
  //                   iscoupon: true,
  //                   cutfee: '0.00',
  //                   coupontxt: '优惠劵未使用！'
  //                 })
  //               } else {
  //                 that.setData({
  //                   cutfee: (couponinfo[0].discount).toFixed(2),
  //                   discount: couponinfo[0].discount,
  //                   iscoupon: false,
  //                 })
  //               }
  //             }
  //           } else {
  //             that.setData({
  //               cutfee: '0.00',
  //               iscoupon: true,
  //               coupontxt: '暂无可用优惠劵！'
  //             })
  //           }
  //           that.totalFn();
  //         }

  //       }
  // }
})
