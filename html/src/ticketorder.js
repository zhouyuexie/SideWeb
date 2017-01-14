import Vue from "vue";
Vue.use(require('vue-resource')); //引用ajax库
require("../css/ticketorder.css");
import "whatwg-fetch";
const _ = require("underscore");
import { MessageBox, Toast, Indicator, Popup, Tabbar, Navbar, TabItem, TabContainer, TabContainerItem } from 'mint-ui';
import 'mint-ui/lib/style.css'

Vue.component(TabContainer.name, TabContainer);
Vue.component(TabContainerItem.name, TabContainerItem);
Vue.component(Tabbar.name, Tabbar);
Vue.component(TabItem.name, TabItem);
Vue.component(Navbar.name, Navbar);

const debug = (function() {
	let test = false;
	let url = window.location.href;
	if (url.slice(0, 5) === "https") {
		test = false;
	} else {
		test = true;
	}
	return test;
})();

//检查请求返回的状态
function checkStatus(response) {
	if (response.status >= 200 && response.status < 300) {
		return response
	} else {
		if (response.status === 401) {
			window.location.href = "/api/oauth2/Index?returnUrl=https://ticket.samecity.com.cn/wx/ticket.html#/";
		} else {
			Indicator.close();
			alert("服务器繁忙,请稍后再试...")
		}
		// var error = new Error(response.statusText)
		// error.response = response
		// throw error
		return response;
	}
}

const config = {
	headers: {
		'Content-Type': 'application/json',
		Authorization: debug ? "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIyNDE1OTE5MDIwMDYwMzEiLCJqdGkiOiJlNGNhY2U1NC0wZDJkLTQwOGYtOGIzMC1lM2FiYmJhYjUwMTYiLCJpYXQiOjE0ODMzNTAxMzAsIk1lbWJlciI6Im5vcm1hbCIsIm5iZiI6MTQ4MzM1MDEzMCwiZXhwIjoxNDg0NTU5NzMwLCJpc3MiOiJTdXBlckF3ZXNvbWVUb2tlblNlcnZlciIsImF1ZCI6Imh0dHA6Ly9sb2NhbGhvc3Q6MTc4My8ifQ.cmj1ZyP3OWnbwuexFwW05_4xYHZ4D7LgTZhrl_He9Rs" : ""
	},
	serverUrl: debug ? "http://192.168.31.80" : ""
}

const Vue_Order = new Vue({
	el: "#app",
	data: {
		OrderList: [],
		index: 1, //页数
		noMoreData: false, //没有更多数据
		isUse: false, //是否使用中
		noDataShow: true, //没有订单数据

		OrderList1: [],
		index1: 1, //页数
		noMoreData1: false, //没有更多数据
		isUse1: false, //是否使用中
		noDataShow1: true, //没有订单数据

		ready: false, //是否准备显示
		Passengers: [], //乘客名数据,方便使用
		orderVisible: false,

		OrderDetail: {}, //订单详细信息
		passenger: "", //乘客名

		selected: "1", //默认选择未支付

		countdown: null, //倒计时
		countdownTime: "", //倒计时显示
		storeCountTime: "", //剩余支付时间
	},
	created() {
		this.ready = true;
		if (this.getQueryString("orderid")) {
			// 需要显示订单详细信息
			this.loading();
			this.getOrderInfo(this.getQueryString("orderid"))
		}
		this.moreOrderData();
		this.moreOrderData1();
	},
	mounted() {
		// 设置第一个显示
		// document.getElementsByClassName("mint-tab-container-item")[0].style.display = "block";
		// document.getElementsByClassName("mint-tab-item")[0].click();
	},
	watch: {
		// 监控tab的变化
		// selected(val){
		// 	console.log(val)
		// }
	},
	methods: {
		loading() {
			Indicator.open({
				spinnerType: 'fading-circle'
			});
		},
		getQueryString(name) {
			let reg = new RegExp('(^|&)' + name + '=([^&]*)(&|$)', 'i');
			let r = window.location.search.substr(1).match(reg);
			if (r !== null) {
				return unescape(r[2]);
			}
			return null;
		},
		moreOrderData() {
			if (this.noMoreData || this.isUse) {
				return;
			}
			this.isUse = true; //锁住这个函数
			this.loading();
			fetch(config.serverUrl + "/api/Order/List", {
					method: "POST",
					headers: config.headers,
					body: JSON.stringify({
						Index: this.index,
						// Size:10,
						Type: 1
					})
				})
				.then(checkStatus)
				.then(result => result.json())
				.then(result => {
					if (result.Data) {
						if (result.Data.length < 10) {
							// 说明没有跟多数据了
							this.noMoreData = true;
						}
						for (let i = 0; i < result.Data.length; i++) {
							this.OrderList.push(result.Data[i]);
						}

						this.noDataShow = false; //显示订单
					} else {
						this.noMoreData = true;
						Toast({
							message: result.Message,
							position: 'bottom',
							duration: 3000
						});
					}
					this.isUse = false; //释放这个函数
					this.index++;
					Indicator.close();
				})
		},
		moreOrderData1() {
			if (this.noMoreData1 || this.isUse1) {
				return;
			}
			this.isUse1 = true; //锁住这个函数
			this.loading();
			fetch(config.serverUrl + "/api/Order/List", {
					method: "POST",
					headers: config.headers,
					body: JSON.stringify({
						Index: this.index1,
						// Size:10,
						Type: 2
					})
				})
				.then(checkStatus)
				.then(result => result.json())
				.then(result => {
					if (result.Data) {
						if (result.Data.length < 10) {
							// 说明没有跟多数据了
							this.noMoreData1 = true;
						}
						for (let i = 0; i < result.Data.length; i++) {
							this.OrderList1.push(result.Data[i]);
						}

						this.noDataShow1 = false; //显示订单
					} else {
						this.noMoreData1 = true;
						Toast({
							message: result.Message,
							position: 'bottom',
							duration: 3000
						});
					}
					this.isUse1 = false; //释放这个函数
					this.index1++;
					Indicator.close();
				})
		},
		openOrder(index) {
			this.loading();
			if (this.selected === "1") {
				this.getOrderInfo(this.OrderList[index].Id)
			} else {
				this.getOrderInfo(this.OrderList1[index].Id)
			}
		},
		getOrderInfo(id) {
			return fetch(config.serverUrl + "/api/Order/Get", {
					method: "POST",
					headers: config.headers,
					body: JSON.stringify({
						OrderId: id
					})
				}).then(result => result.json())
				.then(result => {
					this.OrderDetail = result.Data;
					this.passenger = "";
					for (let i = 0; i < this.OrderDetail.Passengers.length; i++) {
						this.passenger = this.passenger + this.OrderDetail.Passengers[i].Name + ",";
					}
					this.passenger = this.passenger.slice(0, this.passenger.length - 1);
					Indicator.close();
					this.orderVisible = true;
					if (this.selected === "1") {
						// 只有未支付的情况下才倒计时
						this.CountDown();
					}
				})
		},
		payMoney() {
			this.loading();
			let id = this.OrderDetail.Id;
			fetch(config.serverUrl + "/api/Order/PayOrder", {
					method: 'POST',
					headers: config.headers,
					body: JSON.stringify({
						OrderId: id
					})
				})
				.then(result => result.json())
				.then(result => {
					Indicator.close();
					let paydata = result.Data;
					window.WeixinJSBridge.invoke("getBrandWCPayRequest", paydata, function(r) {
						if (r.err_msg === "get_brand_wcpay_request:ok") {
							MessageBox('提示', '支付成功');
						}
					});
				})
		},
		CountDown() {
			let time = new Date(this.OrderDetail.CTime).getTime() + 60 * 30 * 1000;
			let nowTime = Date.now();
			this.storeCountTime = parseInt((time - nowTime) / 1000);
			// this.storeCountTime = 60*30-1;//半个小时
			this.countdown = setInterval(() => {
				if (this.storeCountTime === 0) {
					clearInterval(this.countdown);
					this.countdown = null;
					return;
				}
				let minth = parseInt(this.storeCountTime / 60);
				let second = parseInt(this.storeCountTime % 60);
				if (minth < 10) {
					this.countdownTime = "0" + minth + ":";
				} else {
					this.countdownTime = minth + ":";
				}

				if (second < 10) {
					this.countdownTime = this.countdownTime + "0" + second;
				} else {
					this.countdownTime = this.countdownTime + second;
				}
				this.storeCountTime--;
			}, 1000)
		},
		goback() {
			clearInterval(this.countdown);
			this.countdown = null;
			this.orderVisible = false;
		},
		cancelOrder() {
			fetch(config.serverUrl + "/api/Order/Cancel", {
					method: "POST",
					headers: config.headers,
					body: JSON.stringify({
						OrderId: this.OrderDetail.Id
					})
				})
				.then(checkStatus)
				.then(result => result.json())
				.then(result => {
					MessageBox('提示', '取消订单成功');
				})
		}
	},
	components: {
		"mt-popup": Popup,
	}
});

// window.addEventListener('scroll',_.throttle(function(){
// 	let selected = Vue_Order.selected;
// 	let status = document.getElementById("last").offsetTop-document.body.scrollTop;
// 	if(status<1000 && selected==="1"){
// 		Vue_Order.moreOrderData();
// 		// console.log('yes');
// 	}

// 	let status1 = document.getElementById("last1").offsetTop-document.body.scrollTop;
// 	if(status1<1000 && selected==="2"){
// 		Vue_Order.moreOrderData1();
// 		// console.log('yes');
// 	}
// },100,{leading: false}));
