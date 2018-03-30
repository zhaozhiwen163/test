Page({
  data: { isshopcut: false},
    onLoad: function (options) {
        var that = this;
        if (options.shopcutdetail == ''){
          that.setData({
            isshopcut: true
          })
        }
        that.setData({
            company: options.company,
            address: options.address,
            mob: options.mob,
            fullRegionName: options.fullRegionName,
            shopfeedetail: options.shopfeedetail,
            shopcutdetail: options.shopcutdetail
        })
  },
  onShareAppMessage: function () {

  }
})