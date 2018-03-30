App({
  onLaunch: function () {
    wx.clearStorage();
  //   var that = this;
  //   var util = require('utils/md5.js');
  //   wx.login({
  //     success: function (res) {
  //       var sign = util.hexMD5('appId=' + that.appId +'&code=' + res.code + '&companyId=' + that.companyId + that.key);
  //       if (res.code) {
  //         wx.request({
  //           url: that.http + 'channel/xcx/login',
  //           data: {
  //             appId: that.appId,
  //             code: res.code,
  //             companyId: that.companyId,
  //             sign: sign
  //           },
  //           header: { 'content-type': 'application/json' },
  //           success: function (res) {
  //             var wxData = {
  //               "wxOpenid": res.data.data.wxOpenid,
  //               "clientId": res.data.data.clientId,
  //               "isOpenPay": res.data.data.isOpenPay, 
  //               "region": res.data.data.region,
  //               "mob": res.data.data.mob,
  //               "name": res.data.data.name,
  //               "companyId": that.companyId
  //             }
  //             wx.setStorageSync('wxData', wxData);
  //             wx.setStorageSync('shoppingcarData', []);
  //           },
  //         })
  //       } else {
  //         console.log('获取用户登录态失败！' + res.errMsg)
  //       }
  //     }
  //   })
  },
  appId: "wx6a5ab090b262ade5",
  // http: "https://lz.51test.com/dsi/", 
  // imgHttp: "https://192.168.0.116:8060/",

  // http: "https://test.aizhongwang.cn/dsi/",
  // imgHttp: "http://192.168.0.116:8070/",

  http: "https://dsi.51zhongzi.com/",
  imgHttp: "https://img.51zhongzi.com/",
  companyId: 110095,
  // companyId: 10011172,
  key: '&key=YjU5YTA3NzEtMDI2MS00YzhiLTljM2ItYzE2MTljZDQwNDNhNGExYjEzZTUtYmIx'
  
})
