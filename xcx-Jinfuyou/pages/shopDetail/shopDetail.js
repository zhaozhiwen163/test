// pages/orderDetail/orderDetail.js
var gConfig = getApp();
var util = require('../../utils/md5.js');
var WxParse = require('../../wxParse/wxParse.js');
Page({
  data: {
    // imgUrls: [
    //   { url: 'http://img02.tooopen.com/images/20150928/tooopen_sy_143912755726.jpg' },
    //   { url: 'http://img06.tooopen.com/images/20160818/tooopen_sy_175866434296.jpg' },
    // ],
    indicatorDots: true,
    // autoplay: true,
    interval: 3000,
    duration: 1000,
    circular: true,
    currentTab: 0,
    selected: true,
    hidden: true,
    isError: true,
    isshopcut: true,
    isPlant: true,
    img: '',
    noCpinjs: true,
    noCpincs: true,
    paymentBtn: true
    // isresolve: true
  },
  onLoad: function (options) {
    // 页面初始化 options为页面跳转所带来的参数
    // console.log(options)
    var that = this;
    that.setData({
      itemId: options.itemId,
      region: options.region,
      fullregion: options.fullregion,
    })
  },
  onShow: function () {
    // 页面显示
    this.swiperFn();
    this.getshopinfo();
    this.receiveFn();
    this.introduceFn();
    this.setData({ isMask: true })
    this.getSystemInfo();
    var searchData = wx.getStorageSync('searchData');
    if (searchData) { wx.removeStorageSync('searchData') }
  },
  onHide: function () {
    // 页面隐藏
  },
  onUnload: function () {
    // 页面关闭
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
  //轮播
  swiperFn: function (event) {
    var that = this;

  },
  //商品信息的展示
  getshopinfo: function (event) {
    var that = this;
    var itemId = that.data.itemId;
    var sellData = wx.getStorageSync('sellData')
    var wxData = wx.getStorageSync('wxData')
    if (wxData.region == 0) {
      var region = that.data.region;
    } else {
      var region = wxData.region;
    }
    var sign = util.hexMD5('companyId=' + wxData.companyId + '&itemId=' + itemId + '&region=' + region + gConfig.key);
    wx.request({
      url: gConfig.http + 'channel/xcx/iteminfo',
      data: {
        companyId: wxData.companyId,
        itemId: itemId,
        region: region,
        sign: sign
      },
      header: {
        'content-type': 'application/json'
      },
      success: function (res) {
        if(res.data.result.code==200){
          that.setData({
            paymentBtn: false
          })
        }
        var images = [];
        var itemImgs = res.data.data.itemImgs;

        for (var i = 0; i < itemImgs.length; i++) {
          // var imgs = (itemImgs[i].split('.'))[0] +'.'+ (itemImgs[i].split('.'))[1] + '.400x400.' + (itemImgs[i].split('.'))[1];

          itemImgs[i] = itemImgs[i] + '.400x400.' + (itemImgs[i].split('.'))[1]
          images.push(gConfig.imgHttp + itemImgs[i])
          that.setData({
            img: images,
          })
        }
        if (itemImgs.length <= 1) {
          that.setData({
            indicatorDots: false
          })
        }
        that.setData({
          goodsData: res.data.data,
          shoppingData: res.data.data.itemSkus[0]
        })
        var goodsData = that.data.goodsData;
        var itemSkus = goodsData.itemSkus;
        var currentid = itemSkus[0].id;
        var index = 0;
        // console.log(goodsData)
        that.setData({
          currentid: currentid,
          moq: itemSkus[index].moq == 0 ? 1 : itemSkus[index].moq,
          skuId: itemSkus[index].id,
          company: goodsData.companyName,
          address: goodsData.address,
          mob: goodsData.serviceTel,
          fullRegionName: goodsData.fullName,
          shopfeedetail: goodsData.shipfeedetail,
          shopcutdetail: goodsData.promotioncontent
        })
        if (goodsData.shipfeedetail) {
          that.setData({
            isPlant: false
          })
        }
        if (goodsData.promotioncontent) {
          that.setData({
            isshopcut: false
          })
        }
        if (itemSkus[index].moq > 0) {
          that.setData({
            order: false,
            qty: itemSkus[index].moq
          })
        } else {
          that.setData({
            order: false,
            qty: 1
          })
        }
        var retailPrice = itemSkus[index].retailPrice;
        var retailPromotionPrice = itemSkus[index].retailPromotionPrice;
        if (retailPrice == 0) {
          that.setData({
            isresolve: false
          })
        } else if (retailPromotionPrice != 0 && retailPrice > retailPromotionPrice) {
          that.setData({
            isresolve: true,
            shopprice: retailPromotionPrice.toFixed(2)
          })

        } else {
          that.setData({
            isresolve: true,
            shopprice: retailPrice.toFixed(2)
          })

        }
      }
    })
  },
  //商品规格的选择
  specFn: function (event) {
    var that = this;
    var id = event.currentTarget.dataset.id
    var itemSkus = that.data.goodsData.itemSkus;
    var itemId = that.data.itemId;
    var sellData = wx.getStorageSync('sellData')
    var wxData = wx.getStorageSync('wxData')
    if (wxData.region == 0) {
      var region = that.data.region;
    } else {
      var region = wxData.region;
    }
    for (var i = 0; i < itemSkus.length; i++) {
      if (id == itemSkus[i].id) {
        that.setData({
          currentid: id,
          moq: itemSkus[i].moq == 0 ? 1 : itemSkus[i].moq,
          skuId: itemSkus[i].id,
          shoppingData: itemSkus[i]
        })
        if (itemSkus[i].moq > 0) {
          that.setData({
            order: false,
            qty: itemSkus[i].moq
          })
        } else {
          that.setData({
            order: false,
            qty: 1
          })
        }
        var sign = util.hexMD5('companyId=' + gConfig.companyId + '&itemId=' + itemId + '&region=' + region + '&skuId=' + id + gConfig.key);
        wx.request({
          url: gConfig.http + 'channel/xcx/iteminfo',
          data: {
            companyId: gConfig.companyId,
            itemId: itemId,
            region: region,
            skuId: id,
            sign: sign
          },
          header: {
            'content-type': 'application/json'
          },
          success: function (res) {
            var goodsData = res.data.data;
            that.setData({
              company: goodsData.companyName,
              address: goodsData.address,
              mob: goodsData.serviceTel,
              fullRegionName: goodsData.fullName,
              shopfeedetail: goodsData.shipfeedetail,
              shopcutdetail: goodsData.promotioncontent
            })
          }
        })
        var retailPrice = itemSkus[i].retailPrice;
        var retailPromotionPrice = itemSkus[i].retailPromotionPrice;
        if (retailPrice == 0) {
          that.setData({
            isresolve: false
          })
        } else if (retailPromotionPrice != 0 && retailPrice > retailPromotionPrice) {
          that.setData({
            isresolve: true,
            shopprice: retailPromotionPrice.toFixed(2)
          })
        } else {
          //  if (retailPrice != 0 && retailPromotionPrice == 0) 
          that.setData({
            isresolve: true,
            shopprice: retailPrice.toFixed(2)
          })
        }
      }
    }
    that.setData({ skuId: id });
  },
  goodsNumFn: function (event) {
    var that = this;
    var shoppingData = that.data.shoppingData
    var moqDetail = Number(shoppingData.moq);
    var qtyvalue = (event.detail.value).split('');
    if (qtyvalue[0] == 0) {
      var moqvalue = event.detail.value;
      var index;
      for (var i = 0; i < qtyvalue.length; i++) {
        if (qtyvalue[i] > 0) {
          index = i;
          break;
        }
      }
      var moq = moqvalue.substring(index)
      that.setData({
        moq: (moq == "" || moq <= moqDetail) ? moqDetail : (moq >= 9999 ? 9999 : moq),
        shoppingData: shoppingData
      })
    } else {
      if (moqDetail) {
        that.setData({
          moq: (event.detail.value == "" || event.detail.value <= moqDetail) ? moqDetail : (event.detail.value >= 9999 ? 9999 : event.detail.value),
          shoppingData: shoppingData
        })
      } else {
        that.setData({
          moq: (event.detail.value == "" || event.detail.value <= 1) ? 1 : (event.detail.value >= 9999 ? 9999 : event.detail.value),
          shoppingData: shoppingData
        })
      }
    }
  },
  //点击数量减少
  decrFn: function (event) {
    var that = this;
    var moqDetail = parseInt(that.data.moq);
    var qty = that.data.qty;
    if (moqDetail - 1 < 1) {
      moqDetail = 1;
    } else {
      moqDetail = moqDetail - 1;
    }
    if (qty) {
      if (moqDetail < qty) {
        that.setData({
          moq: qty
        })
      } else {
        that.setData({
          moq: moqDetail
        })
      }
    }

  },
  //点击数量增加
  incrFn: function (event) {
    var that = this;
    var moq = parseInt(that.data.moq);
    if (moq + 1 >= 9999) {
      var moq = 9999;
    } else {
      moq = moq + 1;
    }
    that.setData({
      moq: moq
    })
  },
  //服务商页面的跳转
  facilitatorFn: function (event) {
    var that = this;
    // console.log(that.data.shopfeedetail)
    wx.navigateTo({
      url: '../facilitator/facilitator?company=' + that.data.company + '&address=' + that.data.address + '&mob=' + that.data.mob + '&fullRegionName=' + that.data.fullRegionName + '&shopfeedetail=' + that.data.shopfeedetail + '&shopcutdetail=' + that.data.shopcutdetail
    })
  },
  //点击将数据存储到本地加入购物车
  addcarFn: function (event) {
    var that = this;
    var moq = parseInt(that.data.moq);
    var goods = that.data.goodsData;
    var shoppingData = that.data.shoppingData;
    var skuid = event.currentTarget.dataset.skuid;
    var isOnline = goods.isOnline;
    if (shoppingData.retailPrice == 0) {
      wx.showToast({
        title: '暂不支持添加',
        icon: 'success',
        duration: 2000,
      })
    } else {
      if (isOnline == 0) {
        let isExit = true;
        var shoppingcarData = wx.getStorageSync('shoppingcarData')
        if (shoppingcarData.length > 0) {
          for (var i = 0; i < shoppingcarData.length; i++) {
            if (shoppingcarData[i].skuId == skuid) {
              shoppingcarData[i].moq = moq + shoppingcarData[i].moq;
              wx.setStorageSync('shoppingcarData', shoppingcarData)
              isExit = false;
              break;
            }
          }
        }
        if (isExit) {
          var shopData = [];
          shopData.push({
            moq: moq,
            skuId: skuid,
            id: goods.companyId,
            shopname: goods.name,
            seller: goods.companyName,
            goodsImg: shoppingData.img || goods.defaultImg,
            companyId: goods.companyId,
            onlineTitle: goods.onlineTitle,
            fullregion: that.data.fullregion,
            shopprice: that.data.shopprice,
            specData: shoppingData.norm,
            specunits: shoppingData.units,
            specname: shoppingData.name,
            qty: Number(that.data.qty),
            retailPromotionPrice: shoppingData.retailPromotionPrice,
            brand: goods.brand,
            name: goods.name
          })
          var hb = shoppingcarData.concat(shopData)
          wx.setStorageSync('shoppingcarData', hb)
        }
        wx.showToast({
          title: '加入购物车成功',
          icon: 'success',
          duration: 500
        })
      } else {
        that.setData({
          isError: false,
          errorMsg: '此商品目前只进行展示，不能加入购物车！'
        })
      }
    }
    setTimeout(function () {
      that.setData({ isError: true });
    }, 1500)
  },
  //点击立即购买
  boughtFn: function (event) {
    /*立即购买方法*/
    var that = this;
    that.setData({ isMask: true })
    wx.removeStorageSync('addressData');
    var goods = that.data.goodsData;
    var shoppingData = that.data.shoppingData;
    var shopprice;
    if (shoppingData.retailPromotionPrice > 0) {
      shopprice = shoppingData.retailPromotionPrice
    } else {
      shopprice = shoppingData.retailPrice
    }
    if (shoppingData.retailPrice == 0) {

      wx.showToast({
        title: '暂不支持购买',
        icon: 'success',
        duration: 2000,
      })
      that.setData({ isMask: true })
    } else {
      if (goods.isOnline == 0) {
        shoppingData.img = shoppingData.img + '.220x220.' + (shoppingData.img.split('.'))[1];
        wx.setStorageSync('orderData', [{
          shopname: goods.name,
          companyname: goods.companyName,
          skuId: that.data.skuId,
          companyId: gConfig.companyId,
          onlineTitle: goods.onlineTitle,
          goodsImg: shoppingData.img,
          fullregion: that.data.fullregion,
          shopprice: shopprice,
          moq: that.data.moq <= 1 ? 1 : that.data.moq,
          specData: shoppingData.norm + shoppingData.units,
          retailPromotionPrice: shoppingData.retailPromotionPrice
        }])
        wx.navigateTo({
          url: '../orderConfirm/orderConfirm?kl=' + '',
        })
      } else {
        that.setData({
          isError: false,
          errorMsg: '此商品目前只进行展示，不能购买该商品！'
        })
      }
    }
    setTimeout(function () {
      that.setData({ isError: true });
    }, 1500)
  },
  //点击切换至侃价页面
  bargainFn: function (e) {
    var that = this;
    wx.navigateTo({
      url: '../bargain/bargain',
    })
  },
  //产品参数
  swichNavFn: function (event) {
    var that = this;
    var itemId = that.data.itemId
    var sign = util.hexMD5('itemId=' + itemId + gConfig.key);
    that.setData({
      selected: true,
      selected1: false,
      selected2: false,
      noCpincs: true
    })
    wx.request({
      url: gConfig.http + 'item/attr',
      data: { itemId: itemId, sign: sign },
      header: {
        'content-type': 'application/json'
      },
      success: function (res) {

        that.setData({
          shopinfo: res.data.data
        })
        if (res.data.data.length == 0) {
          that.setData({
            noCpincs: false
          })
        }
      }
    })
  },
  //商品介绍
  introduceFn: function (event) {
    var that = this;
    that.setData({
      noCpinjs: true
    })
    var itemId = that.data.itemId
    var sign = util.hexMD5('itemId=' + itemId + gConfig.key);
    that.setData({
      selected: false,
      selected1: true,
      selected2: false
    })
    wx.request({
      url: gConfig.http + 'item/detail',
      data: { itemId: itemId, sign: sign },
      header: {
        'content-type': 'application/json'
      },
      success: function (res) {
        var parameterData = res.data.data
        if (res.data.data == "") {
          that.setData({
            noCpinjs: false
          })
        }
        WxParse.wxParse('parameterData', 'html', parameterData, that, 5);
        that.setData({
          wxParseData: parameterData
        })
      }
    })
  },
  ensureFn: function (event) {
    var that = this;
    that.setData({
      selected: false,
      selected1: false,
      selected2: true
    })
  },
  //送货地址为空时
  receiveFn: function (event) {
    var that = this;
    var wxData = wx.getStorageSync('wxData');
    var sellData = wx.getStorageSync('sellData')
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
        if (addrList.length != 0) {
          for (var i = 0; i < addrList.length; i++) {
            if (addrList[i].isDefault == 1) {
              that.setData({
                addr: addrList[i].regionName + addrList[i].address,
              })
              break;
            } else {
              that.setData({
                addr: sellData.regionName
              })
            }
          }
        } else {
          that.setData({
            addr: sellData.regionName
          })
        }
      }
    })
  },
  onShareAppMessage: function () {

  }
})
