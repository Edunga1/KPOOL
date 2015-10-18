// /* Kumoh CarPool Global variables */
var KCP = {
	domain:				"http://localhost:8080/KumohCarPool",	// 서버 URL
	deviceid:			"a",									// device id
	regid:				null,									// google gcm regid
};

(function(window) {
	/* functions */
	// 등록이 필요한지 여부 반환
	var isNeedRegistration = function(){
		var today = new Date();
		if(window.localStorage.vdate && new Date(parseInt(window.localStorage.vdate)).getTime() > today.getTime())
			return false;
		else
			return true;
	}
	// 유효기간 갱신
	var renewVdate = function(){
		var time = new Date();
		window.localStorage.vdate = time.getTime() + 24*60*60*1000;
	}
	// 디바이스 정보 획득
	var setDeviceInfo = function(){
		// 디바이스 ID 획득
		if(KCP.deviceid == null){
			KCP.deviceid = device.uuid;
		}
		// 푸시 정보 획득
		if(device.platform.toUpperCase() == 'ANDROID'){
			window.plugins.pushNotification.register(successHandler, errorHandler, {
				"senderID" : "60318613763",	// Google GCM 서비스에서 생성한 Project Number를 입력한다.
				"ecb" : "onNotificationGCM"	// 디바이스로 푸시가 오면 onNotificationGCM 함수를 실행할 수 있도록 ecb(event callback)에 등록한다.
			});
		}else{
			// PushPlugin을 설치했다면 window.plugins.pushNotification.register를 이용해서 iOS 푸시 서비스를 등록한다.
			window.plugins.pushNotification.register(tokenHandler, errorHandler, {
				"badge":"true", // 뱃지 기능을 사용한다.
				"sound":"true", // 사운드를 사용한다.
				"alert":"true", // alert를 사용한다.
				"ecb": "onNotificationAPN" // 디바이스로 푸시가 오면 onNotificationAPN 함수를 실행할 수 있도록 ecb(event callback)에 등록한다.
			});
		}
	}
	// 푸쉬 Receive / Regist Callback function - ANDROID
	// onNotification***은 반드시 window의 멤버함수로 존재해야 함
	window.onNotificationGCM = function(e){
		switch(e.event){
			// 안드로이드 디바이스의 registerID를 획득하는 event 중 registerd 일 경우 호출된다.
			case 'registered':
				KCP.regid = e.regid;
			break;
			// 안드로이드 디바이스에 푸시 메세지가 오면 호출된다.
			case 'message':
				//e.message = decodeURIComponent(e.message.replace(/\+/g, '%20'));
				// 푸시 메세지가 왔을 때 앱이 실행되고 있을 경우
				if (e.foreground){
					alert(e.message);
				}
				// 푸시 메세지가 왔을 때 앱이 백그라운드로 실행되거나 실행되지 않을 경우
				else {
					// 푸시 메세지가 왔을 때 푸시를 선택하여 앱이 열렸을 경우
					if(e.coldstart){
					}
					// 푸시 메세지가 왔을 때 앱이 백그라운드로 사용되고 있을 경우
					else{
					}
				}
				navigator.notification.alert(e.payload.title);
			break;
			// 푸시 메세지 처리에 에러가 발생하면 호출한다.
			case 'error':
			break;
			// 알 수 없음
			case 'default':
			break;
		}
	}
	// 푸쉬 Receive / Regist Callback function - IOS
	window.onNotificationAPN = function(event){
		// 푸시 메세지에 alert 값이 있을 경우
		if(event.alert){
			navigator.notification.alert(event.alert);
		}
		// 푸시 메세지에 sound 값이 있을 경우
		if(event.sound){
			var snd = new Media(event.sound);
			snd.play();
		}
		// 푸시 메세지에 bage 값이 있을 경우
		if(event.badge){
			window.plugins.pushNotification.setApplicationIconBadgeNumber(successHandler, errorHandler, event.badge);
		}
	}
	// 푸쉬 State Callback functions
	var tokenHandler = function(result){
		console.log('deviceToken:' + result);
	}
	var errorHandler = function(err){
		console.log('error:' + err);
	}
	var successHandler = function(result){
		console.log('result:'+result);
	}
	
	/* main */
	document.addEventListener("deviceready", function(){
		// // 디바이스 정보 획득
		// setDeviceInfo();
		// // 사용자 등록 유효기간이 지났으면 서버에 등록 요청
		// if(isNeedRegistration()){
			// if(KCP.deviceid){
				// $.ajax({
					// url	: KCP.domain+"/carpoolboard/insertUser.do",
					// data: {
						// "userId": KCP.deviceid
					// },
					// type: "post",
					// success: function(response){
						// renewVdate();
					// }
				// });
			// }
		// }
	}, false);
	document.addEventListener("backbutton", function (e){
        e.preventDefault();
    }, false);
})(window);