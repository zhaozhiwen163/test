// pages/index/index.js
var gConfig = getApp();
var util = require('../../utils/md5.js');
Page({
  data: {
    num:'',
    dom: '全部商品',
    indicatorDots: true,
    autoplay: true,
    interval: 3000,
    duration: 1000,
    swiperCurrent: 0,
    circular: true,
    search: false,
    hidden: true,
    isSearch: true,
    iscome: true,
    dot: false,
    hideloading: true,
    iscoupon: true,
    // tabIdx:1,
    pageNum: 1,
    imgPath: gConfig.imgHttp,
    packageList: true,
    // region: wx.getStorageSync('wxData').region,
    // packageQty: 1
    pickeSs: '',
    noShoplist: true,
    searchShop: ''
   
  },
  onLoad: function () {
    this.loginFn();
    this.getPositionFn();
    this.imgUrls();
    // this.skipFn();
  },
  onShow: function () {
    // 页面显示
    var that = this;
    that.setData({ dot: false, iscome: true, dotclass: ['on', '', ''], isMask: true ,searchShop: ''});
    var searchData = wx.getStorageSync('searchData');
    var sellData = wx.getStorageSync('sellData');
    var wxData = wx.getStorageSync("wxData");
    
    
    if (sellData) { 
      // that.skipFn(); 
      that.shopFn(); 
    }//如果已经定位  那么就不需要再次定位  直接加载商品数据
    // if (that.data.kl && !that.data.shopsData) { 
      // that.skipFn();
      
      // that.shopFn(); 
      //}//防止用户进入小程序至一半时退出后没有数据
    that.getSystemInfo();
    // that.setData({
    //   // shopsData:[]
    //   // tabIdx: 1
    // })
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
  onHide: function () {
    // 页面隐藏
  },
  onUnload: function () {
    // 页面关闭
  },

 loginFn: function() {
    var that = this;
    var util = require('../../utils/md5.js');
    wx.login({
      success: function (res) {
        var sign = util.hexMD5('appId=' + gConfig.appId + '&code=' + res.code + '&companyId=' + gConfig.companyId + gConfig.key);
        if (res.code) {
          wx.request({
            url: gConfig.http + 'channel/xcx/login',
            data: {
              appId: gConfig.appId,
              code: res.code,
              companyId: gConfig.companyId,
              sign: sign
            },
            header: { 'content-type': 'application/json' },
            success: function (res) {
              var wxData = {
                "wxOpenid": res.data.data.wxOpenid,
                "clientId": res.data.data.clientId,
                "isOpenPay": res.data.data.isOpenPay,
                "region": res.data.data.region,
                "mob": res.data.data.mob,
                "name": res.data.data.name,
                "companyId": gConfig.companyId
              }
              wx.setStorageSync('wxData', wxData);
              wx.setStorageSync('shoppingcarData', []);
            },
          })
        } else {
          console.log('获取用户登录态失败！' + res.errMsg)
        }
      }
    })
  },
  // 轮播图
  imgUrls: function(event){
    var that = this;
    var wxData = wx.getStorageSync('wxData');
    var companyId = wxData.companyId;
    var sign = util.hexMD5('companyId=' + gConfig.companyId + gConfig.key);
    wx.request({
      url: gConfig.http + 'channel/xcx/shopinfo',
      header: {
        'content-type': 'application/json'
      },
      method: "get",
      data: {
        companyId: gConfig.companyId,
        sign: sign
      },
      success: function (res){
        if (res.data.result.code == 200 && res.data.data.name) {
          wx.setNavigationBarTitle({ title: res.data.data.name})
        }  
        var banners = [];
        if (res.data.data.img){
          banners.push(gConfig.imgHttp + res.data.data.img)
          
        }else{
          that.setData({
            logoHid: true
          })
        }
        // for (var i = 0; i < res.data.data.banners.length; i++){
        //   banners.push(gConfig.imgHttp + res.data.data.banners[i])
        // }
        that.setData({bannerImg: banners})
        if (banners.length <= 1) {
          that.setData({indicatorDots: false})
        }
      }
    })
  },
  shopFn: function (event) {
    var that = this;
    var wxData = wx.getStorageSync('wxData');
    var companyId = wxData.companyId;
    var sign = util.hexMD5('companyId=' + gConfig.companyId + gConfig.key);
    wx.request({
      url: gConfig.http + 'channel/xcx/shopinfo',
      data: {
        companyId: gConfig.companyId,
        sign: sign
      },
      header: {
        'content-type': 'application/json'
      },
      success: function (res) {
        if (res.data.result.code == 200 && res.data.data.name) {
          that.setData({
            title: res.data.data.name
          })
          wx.setNavigationBarTitle({ title: res.data.data.name})
        }
      }
    })
  },
  //获取地理位置
  getPositionFn: function () {
    var that = this;
    wx.getLocation({
      type: 'wgs84',
      success: function (res) {
        that.setData({ isPosition: '' })
        that.seatFn(res.latitude, res.longitude)

      },
      fail: function () {
        that.setData({ isPosition: true })
      }
    })
  },
  //此方法是点击授权的方法
  getaddressFn: function (event) {
    var that = this;
    that.setData({ isPosition: true })
    if (wx.openSetting) {
      wx.openSetting({
        success: (res) => {
          if (res.authSetting["scope.userLocation"] == true) {
            that.setData({ isPosition: '' })
            wx.getLocation({
              scope: "scope.userLocation",
              type: 'wgs84',
              success: function (res) {
                that.seatFn(res.latitude, res.longitude)
              },
              fail: function (res) {
                that.getPositionFn();
              }
            })
          } else {
            that.setData({
              isPosition: true
            })
          }
        }
      })
    } else {
      wx.showModal({
        title: '提示',
        content: '当前微信版本过低，无法使用该功能，请升级到最新微信版本后重试。'
      })
    }

  },
  seatFn: function (lati, longi) {
    //获取当前所在区域
    var that = this;
    that.setData({ kl: 1 })
    var wxData = wx.getStorageSync('wxData');
    var companyId = wxData.companyId;
    var sign = util.hexMD5('x=' + lati + '&y=' + longi + gConfig.key);
    wx.request({
      url: gConfig.http + 'channel/xcx/region',
      data: {
        x: lati,
        y: longi,
        sign: sign
      },
      header: {
        'content-type': 'application/json'
      },
      success: function (res) {
        // that.setData({
        //   region: res.data.data.region
        // });
        
        wx.setStorageSync('sellData', { region: res.data.data.region, companyId: gConfig.companyId, regionName: res.data.data.regionName })
        // var region = (that.data.region).slice(0, 2)
 
        that.skipFn();
        
        var wxData = wx.getStorageSync('wxData');
        // if (wxData.clientId == 0){
        //   wx.setStorageSync('wxData', {
        //   "wxOpenid": wxData.wxOpenid,
        //   "clientId": wxData.clientId,
        //   "isOpenPay": wxData.isOpenPay,
        //   "region": res.data.data.region,
        //   "mob": wxData.mob,
        //   "name": wxData.name,
        //   "companyId": gConfig.companyId
        // })
        // }     
      },
    })
  },
  //此方法为了防止app.js加载慢于index.js页面
  skipFn: function (event) {
    var that = this;
    var wxData = wx.getStorageSync('wxData');
    var sellData = wx.getStorageSync('sellData')
    if (!wxData) {
      that.setData({ hideloading: false })
      var timer = setInterval(function () {
        var wxData = wx.getStorageSync('wxData');
        if (wxData) {
          that.setData({ hideloading: true })
          clearTimeout(timer);
          // if (wxData.clientId == 0) {
          //   // wx.redirectTo({
          //   //   // url: '../register/register'
          //   //   url: '../index/index'
          //   // })
          // } else {
            // that.couponFn()
           
              that.refreshFn();
           
            
          // }
        }
      },10 )
    } else {
      // if (wxData.clientId == 0) {
      //   // wx.redirectTo({
      //   //   // url: '../register/register'
      //   //   url: '../index/index'
      //   // })
      // } else {
        // that.couponFn();
      that.setData({ hideloading: true })
        that.refreshFn();
      // }
    }
  },

  //初始全部商品列表
  refreshFn: function (region) {
    var that = this;
    that.setData({
      tap: 1,
      search: false,
      isSearch: true
    })
      that.shopjoggleFn(1);
  },

  // 优惠劵方法
  // couponFn: function (event) {
  //   var that = this;
  //   var wxData = wx.getStorageSync('wxData');
  //   var sellData = wx.getStorageSync('sellData');
  //   var companyId = wxData.companyId;
  //   var searchname = that.data.searchname;
  //   if (wxData.region == "" || !wxData.region) {
  //     that.setData({
  //       region: sellData.region
  //     })
  //   } else {
  //     that.setData({
  //       region: wxData.region
  //     })
  //   }
  //   var sign = util.hexMD5('companyId=' + companyId + '&region=' + that.data.region + gConfig.key);
  //   wx.request({
  //     url: gConfig.http + 'channel/xcx/coupons',
  //     data: {
  //       'companyId': companyId,
  //       'region': that.data.region,
  //       'sign': sign
  //     },
  //     header: {
  //       'content-type': 'application/json'
  //     },
  //     success: function (res) {
  //       var couponData = res.data.data
  //       if (couponData.length > 0) {
  //         var discount;
  //         for (var i = 0; i < couponData.length; i++) {
  //           couponData[i].discount=couponData[i].discount.toFixed(2);
  //           couponData[i].endTime = couponData[i].endTime.slice(0, 10)
  //           discount = (couponData[i].discount).toString().length;
  //           couponData[i].font = discount;
  //         }
          
  //         var width = (380 * couponData.length) + 'rpx';
  //         that.setData({
  //           iscoupon: false,
  //           coupon: couponData,
  //           width: width,
  //         })
  //       } else {
  //         that.setData({
  //           iscoupon: true
  //         })
  //       }
  //     },
  //     faild: function (res) {
  //       that.setData({
  //         iscoupon: true
  //       })
  //     }
  //   })
  // },
  //上拉加载更多
  onReachBottom: function (event) {
    var that = this;
    if (that.data.seachshopData) {
          that.dotfor();
          that.setData({ dot: false, iscome: false })
         var timerSt = setTimeout(function () { that.searchDataFn() }, 1500) 
        }else{
          that.dotfor();
          that.setData({ dot: false, iscome: false })
          var timerSt = setTimeout(function () { that.shopjoggleFn(that.data.pageNum) }, 1500)
        }
    

  },
  //推荐商品加载  
  shopjoggleFn: function (pageNum, event) {
    var that = this;
    var wxData = wx.getStorageSync('wxData');
    var sellData = wx.getStorageSync('sellData');
    var companyId = gConfig.companyId;
    // var tap = that.data.tap ? that.data.tap : 1; 
    var searchname = that.data.searchname;
    if (wxData.region == "" || !wxData.region) {
      that.setData({
        region: sellData.region
      })
    } else {
      that.setData({
        region: wxData.region
      })
    }
    var sign = util.hexMD5('companyId=' + companyId + '&isOnline=' + 0 + '&pageNum=' + pageNum + '&perpage=' + 10 + '&region=' + that.data.region + gConfig.key);
    wx.request({
      url: gConfig.http + 'channel/xcx/items',
      data: {
        // categoryId: categoryId,
        companyId: companyId,
        // pageNum: tap,
        pageNum: pageNum,
        perpage: 10,
        isOnline: 0,
        region: that.data.region,
        sign: sign
      },
      header: {
        'content-type': 'application/json'
      },
      success: function (res) {
        var shopDetailData = res.data.data[0].list;
        if (that.data.pageNum == 1 && 　shopDetailData.length < 1){
          that.setData({
            noShoplist: false
          })
        }
        var images = [];
        for (var i = 0; i < shopDetailData.length; i++) {
          shopDetailData[i].price = shopDetailData[i].price.toFixed(2)
          // var imgs = gConfig.imgHttp + shopDetailData[i].defaultImg
          shopDetailData[i].defaultImg = (shopDetailData[i].defaultImg.split('.'))[0] + '.' + (shopDetailData[i].defaultImg.split('.'))[1] + '.220x220.' + (shopDetailData[i].defaultImg.split('.'))[1];
          var imgs =(shopDetailData[i].defaultImg.split('.'))[0] + '.' + (shopDetailData[i].defaultImg.split('.'))[1] + '.220x220.' + (shopDetailData[i].defaultImg.split('.'))[1];
          
          for (var j = 0; j < shopDetailData.length-1; j++) {
            images.push(gConfig.imgHttp + imgs)
          }  

        }
        
        that.setData({
          images: images,
          packageList: true,
          search:false
        })
        if (shopDetailData.length > 0) {

          //将已有的数据和加载的数据放到一起
          if (that.data.pageNum == 1) {
            that.setData({
              shopsData: shopDetailData,
              pageNum: pageNum + 1
            })
          } else {
            var shopsData = that.data.shopsData.concat(shopDetailData)
            //再次进行页面重绘
            that.setData({
              shopsData: shopsData,
              pageNum: pageNum + 1
            })
          }
        } else {
          if (pageNum == 1) {

            setTimeout(function () { that.setData({ dot: true, iscome: true }) }, 1500)
          } else {

            that.setData({ dot: true })
            setTimeout(function () { that.setData({ iscome: true }) }, 1500)
          }

        }
      }
    })
  },
  //推荐商品点击跳转详情
  shopdetailFn: function (event) {
    var that = this;
    that.setData({
      isMask: false
    })
    var wxData = wx.getStorageSync('wxData');
    var sellData = wx.getStorageSync('sellData');
    var searchData = that.data.seachshopData
    // wx.getStorageSync('searchData')
    var searchname = that.data.searchname;
    if (wxData.region == "" || !wxData.region) {
      var region = sellData.region;
    } else {
      var region = wxData.region;
    }
    var shopData = that.data.shopsData;
    var index = parseInt(event.currentTarget.dataset.index);
    var seachshopData = that.data.seachshopData;
    var searchname = that.data.searchname;
    var itemId;
    if (searchData) {
      for (var i = 0; i < seachshopData.length; i++) {
        if (index == i) {
          itemId = seachshopData[i].id
          if (seachshopData[i].price == 0) {
            that.setData({
              isMask: true
            })
            wx.showToast({
              title: '暂不销售',
              icon: 'success',
              duration: 2000,
            })
          } else {
            wx.navigateTo({
              url: '../shopDetail/shopDetail?itemId=' + itemId + '&region=' + region,
            
            })
          }
        }
      }
    } else {
      for (var i = 0; i < shopData.length; i++) {
        if (index == i) {
          itemId = shopData[i].id
          if (shopData[i].price == 0) {
            that.setData({
              isMask: true
            })
            wx.showToast({
              title: '暂不销售',
              icon: 'success',
              duration: 2000
            })
          } else {
            console.log(that.data.region)
            wx.navigateTo({
              url: '../shopDetail/shopDetail?itemId=' + itemId + '&region=' + region + '&fullregion=' + that.data.region,
            })
          }
        }
      }
    }
    that.setData({
      dot: false,
    })
  },
  
  dotfor: function () {
    var that = this;
    that.setData({ dotclass: ['on', '', ''] });
    var dotclass = that.data.dotclass;
    var n = 1;
    var timer = setInterval(function () {
      n = n > dotclass.length ? 1 : n;
      for (var i = 0; i < dotclass.length; i++) {
        if ((n - 1) == i) {
          dotclass[i] = 'on'
          that.setData({ dotclass: dotclass })
        } else {
          dotclass[i] = ''
          that.setData({ dotclass: dotclass })
        }
      }
      n++;
      if (n == 4) { clearInterval(timer) }
    }, 500)

  },
  // 搜索
  bindSearchFn: function(){
    var that=this;  
    wx.navigateTo({
      url: '../search/search?searchShop=' + that.data.searchShop,
    })
  },
  bindblurFn: function(e){
    
    var that=this;
    that.setData({
      searchShop: e.detail.value
    })
  },
  // 九宫格点击
  getsearchFn: function(e){
    // console.log(e)
    wx.navigateTo({
      url: '../search/search?categoryId=' + e.currentTarget.dataset.categoryid
    })
  },
  onShareAppMessage: function () {

  }
  

})