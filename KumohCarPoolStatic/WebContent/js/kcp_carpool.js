(function(window) {
"use strict"

// 카풀 서버와 디바이스 정보
var KCP = {
	domain:				"http://localhost:8080/KumohCarPool",	// 서버 URL
	deviceid:			"a",									// device id
	regid:				null,									// google gcm regid
};

// 디바이스 정보 초기화
(function(){
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

	document.addEventListener("deviceready", function(){
		// 디바이스 정보 획득
		setDeviceInfo();
		// 사용자 등록 유효기간이 지났으면 서버에 등록 요청
		if(isNeedRegistration()){
			if(KCP.deviceid){
				$.ajax({
					url	: KCP.domain+"/carpoolboard/insertUser.do",
					data: {
						"userId": KCP.deviceid
					},
					type: "post",
					success: function(response){
						renewVdate();
					}
				});
			}
		}
	}, false);
	document.addEventListener("backbutton", function (e){
        e.preventDefault();
    }, false);
})();

// -------------------------

var module = angular.module("kcp", ["angularjs-datetime-picker"])
.service("UtilService", function(){

	// 10미만 정수를 받아 2자리 수로 변환하여 반환한다.
	// 반환된 값은 문자열로 타입변경 된다.
	// n: 정수
	this.addZero = function(n){
		return n < 10 ? '0' + n : '' + n;
	}

	// ms를 날짜 형식으로 변환한다.
	// ms: 밀리세컨드
	this.ms2foramttedTime = function(ms){
		var date = new Date(ms);
		return date.getFullYear() + "-" + this.addZero(date.getMonth()+1) + "-" + this.addZero(date.getDate()) + " " + this.addZero(date.getHours()) + ":" + this.addZero(date.getMinutes());
	}
	
	// 카풀 model에 formattedDate를 추가한다.
	// arr: 카풀 목록
	this.carpoolDataProc = function(arr){
		var time = new Date(arr.carpoolTime);
		arr.formattedTime = this.addZero(time.getHours()) + ":" + this.addZero(time.getMinutes());
		return arr;
	}
})
.service("AjaxService", function($http, $q){
	
	// 비동기 통신 defer
	// 에러시 상태코드, 성공 시 response 반환
	var ajax = function(url, data){
		var deferred = $q.defer();
		$http({
			url: url,
			params: data
		})
		.success(function(data, status){
			if(status === 200){
				deferred.resolve(data);
			}else{
				deferred.reject(status);
			}
		})
		.error(function(data, status){
			deferred.reject(status);
		});
		return deferred.promise;
	}

	// 카풀 목록
	// pgn: pgination
	this.selectCarpoolList = function(pgn){
		return ajax(
			"http://localhost:8080/KumohCarPool/carpoolboard/getList.do", {
				"pageIndex": pgn,
				"pageNumber": 3
			}
		);
	}
	
	// 카풀 상세 정보
	// boardid: 카풀 게시글 ID
	this.selectCarpoolDetail = function(boardid){
		return ajax(
			"http://localhost:8080/KumohCarPool/carpoolboard/getBoard.do", {
				"cpBoardId": boardid,
				"userId": KCP.deviceid
			}
		);
	}
	
	// 카풀 등록
	// data: 카풀 정보, 데이터
	this.insertCarpool = function(data){
		data.userId = KCP.deviceid;
		console.log(data);
		return ajax(
			"http://localhost:8080/KumohCarPool/carpoolboard/insertBoard.do",
			data
		);
	}
	// 카풀 수정
	// data: 카풀 정보, 데이터
	this.updateCarpool = function(data){
		data.userId = KCP.deviceid;
		return ajax(
			"http://localhost:8080/KumohCarPool/carpoolboard/updateBoard.do",
			data
		);
	}
	
	// 카풀 삭제
	// boardid: 카풀 게시글 ID
	this.deleteCarpool = function(boardid){
		return ajax(
			"http://localhost:8080/KumohCarPool/carpoolboard/deleteBoard.do", {
				"cpBoardId": boardid,
				"userId": KCP.deviceid
			}
		);
	}
	
	// 내 카풀 목록
	this.selectMyCarpoolList = function(){
		return ajax(
			"http://localhost:8080/KumohCarPool/carpoolboard/getMyList.do", {
				"userId": KCP.deviceid
			}
		);
	}
	
	// 카풀 참여
	// boardid: 카풀 게시글 ID
	this.attendCarpool = function(boardid){
		return ajax(
			"http://localhost:8080/KumohCarPool/carpoolboard/attend.do", {
				"cpBoardId": boardid,
				"userId": KCP.deviceid
			}
		);
	}
	
	// 카풀 취소
	// boardid: 카풀 게시글 ID
	this.cancelCarpool = function(boardid){
		return ajax(
			"http://localhost:8080/KumohCarPool/carpoolboard/cancel.do", {
				"cpBoardId": boardid,
				"userId": KCP.deviceid
			}
		);
	}
	
	// 덧글 추가
	// boardid: 카풀 게시글 ID
	// contents: 덧글 내용
	this.insertComment = function(boardid, contents){
		return ajax(
			"http://localhost:8080/KumohCarPool/carpoolboard/addComment.do", {
				"cpBoardId": boardid,
				"comment": contents,
				"userId": KCP.deviceid
			}
		);
	}
	
	// 목적지 정보
	this.selectDest = function(boardid, contents){
		return ajax(
			"http://localhost:8080/KumohCarPool/destination/select.do", {
				"userId": KCP.deviceid
			}
		);
	}
	
	// 목적지 정보 입력/변경
	// start: 출발지
	// arrive: 도착지
	// time: 카풀 시간
	this.insertDest = function(start,arrive,time){
		return ajax(
			"http://localhost:8080/KumohCarPool/destination/add.do", {
				"startPoint": start,
				"arrivePoint": arrive,
				"carpoolTime": time,
				"userId": KCP.deviceid
			}
		);
	}
	
	// 목적지 정보 삭제
	this.deleteDest = function(){
		return ajax(
			"http://localhost:8080/KumohCarPool/destination/delete.do", {
				"userId": KCP.deviceid
			}
		);
	}
	
	// 메시지 목록
	this.selectMessageList = function(){
		return ajax(
			"http://localhost:8080/KumohCarPool/message/getMessage.do", {
				"userId": KCP.deviceid
			}
		);
	}
	
	// 매칭 정보
	this.selectMessageList = function(){
		return ajax(
			"http://localhost:8080/KumohCarPool/destination/match.do", {
				"userId": KCP.deviceid
			}
		);
	}
})
.controller("CarpoolCtrl", function($window, $scope, $http, UtilService, AjaxService, MapService){
	var pgn = 0;			// 카풀 목록 pagination
	$scope.menu = false;	// 메뉴 출력 여부
	$scope.modal = "";		// 활성화 할 모달
	$scope.isMypool = false;// 현재 카풀 목록이 내 카풀 목록인지 여부
	$scope.models = {
		carpools: [],			// 카풀 목록
		dest: {					// 목적지 설정 정보
			startPoint: "",
			arrivePoint: "",
			carpoolTime: "",
			isExist: false
		},
		messages: [],			// 메시지 목록
		matching: {				// 매칭 정보
			message: "",
			isMatching: false
		},
	}
	
	// 카풀 로드
	$scope.loadmore = function(){
		AjaxService.selectCarpoolList(pgn).then(
			function(response){
				pgn += response.lists.length;
				if($scope.isMypool){
					$scope.isMypool = false;
					$scope.models.carpools = [];
				}
				for(var i in response.lists){
					UtilService.carpoolDataProc(response.lists[i]);
				}
				$scope.models.carpools.push.apply($scope.models.carpools, response.lists);
			}
		);
	}
	
	// 상세보기
	$scope.readmore = function($event, i){
		AjaxService.selectCarpoolDetail($scope.models.carpools[i].cpBoardId).then(
			function(response){
				$scope.models.carpools[i] = UtilService.carpoolDataProc(response.board);
				$scope.models.carpools[i].comments = response.comments;
				$scope.models.carpools[i].permission = response.permission;
			}
		);
	}
	
	// 내 카풀 로드
	// pagination과 카풀 목록 model에 덮어 쓴다.
	$scope.loadMyCarpools = function(){
		AjaxService.selectMyCarpoolList().then(
			function(response){
				if(!response.isEmpty){
					pgn = 0;
					$scope.isMypool = true;
					for(var i in response.lists){
						UtilService.carpoolDataProc(response.lists[i]);
					}
					$scope.models.carpools = response.lists;
				}else{
					alert("내가 포함된 카풀이 없어요!");
				}
			}
		);
	}
	
	// 카풀 참여
	$scope.requestCarpoolAttend = function(i){
		AjaxService.attendCarpool($scope.models.carpools[i].cpBoardId).then(
			function(response){
				if(response.res){
					$scope.models.carpools[i].currentPersons = response.currentPersons;
					$scope.models.carpools[i].permission.isAttendant = true;
					alert("해당 카풀에 참여했습니다!");
				}else{
					alert("더 이상 참여할 수 없습니다.");
				}
			},
			function(status){
				alert("참여할 수 없습니다.");
			}
		);
	}
	
	// 카풀 취소
	$scope.requestCarpoolCancel = function(i){
		AjaxService.cancelCarpool($scope.models.carpools[i].cpBoardId).then(
			function(response){
				if(response.res){
					$scope.models.carpools[i].currentPersons = response.currentPersons;
					$scope.models.carpools[i].permission.isAttendant = false;
					alert("취소되었습니다.");
				}
			}
		);
	}
	
	// 덧글 등록
	// contents: 덧글 내용
	$scope.submitComment = function(i, contents){
		if(contents.length > 0){
			AjaxService.insertComment($scope.models.carpools[i].cpBoardId, contents).then(
				function(response){
					$scope.models.carpools[i].comments = response.commentList;	// model 갱신
				}
			);
		}
	}
	
	// 목적지 정보 로드
	$scope.loadDest = function(){
		AjaxService.selectDest().then(
			function(response){
				if(response.res){
					angular.extend($scope.models.dest, response.destination);
					$scope.models.dest.carpoolTime = UtilService.ms2foramttedTime(response.destination.carpoolTime);
					$scope.models.dest.isExist = true;
				}
			}
		);
	}
	
	// 목적지 정보 수정/입력
	$scope.saveDest = function(){
		AjaxService.insertDest(
			$scope.models.dest.startPoint,
			$scope.models.dest.arrivePoint,
			$scope.models.dest.carpoolTime
			
		).then(
			function(response){
				$scope.destForm.$setPristine();		// 변경 내역 초기화
				$scope.models.dest.isExist = true;
			}
		);
	}
	
	// 목적지 정보 삭제
	$scope.deleteDest = function(){
		AjaxService.deleteDest().then(
			function(response){
				for(var key in $scope.models.dest){	// model 초기화
					if(typeof $scope.models.dest[key] == "string"){
						$scope.models.dest[key] = "";
					}else if(typeof $scope.models.dest[key] == "boolean"){
						$scope.models.dest[key] = false;
					}
				}
			}
		);
	}
	
	// 메시지 목록 로드
	$scope.loadMessages = function(){
		AjaxService.selectMessageList().then(
			function(response){
				$scope.models.messages = response.messageList;
			}
		);
	}
	
	// 매칭 정보 로드
	$scope.selectMatchingResult = function(){
		AjaxService.selectMessageList().then(
			function(response){
				angular.extend($scope.models.matching, response);
			}
		);
	}
	
	// 상세 보기 toggle
	$scope.toggleDetail = function(i){
		if($scope.cidx == i)
			$scope.cidx = -1;
		else{
			$scope.cidx = i;
			MapService.moveMarker($scope.models.carpools[i].startLatitude, $scope.models.carpools[i].startLongitude);
		}
	}
	
	// 글쓰기 페이지로 이동
	// param: 함께 보낼 정보
	$scope.writepage = function(param){
		var url = "./carpool_add.html";
		if(typeof param !== "undefined"){
			url += param
		}
		$window.location.href = url;
	}
	
	// 목적지 정보와 함께 글쓰기 페이지로 이동
	$scope.createCarpool = function(){
		var param = "?carpoolTime=" + escape($scope.models.dest.carpoolTime)
				+ "&startPoint=" + escape($scope.models.dest.startPoint)
				+ "&arrivePoint=" + escape($scope.models.dest.arrivePoint);
		$scope.writepage(param);
	}
	
	// 카풀 수정/삭제 페이지로 이동
	$scope.modify = function(i){
		window.location.href = "carpool_add.html?boardid=" + $scope.models.carpools[i].cpBoardId;
	}
	
	// initialize
	$scope.loadDest();	// 로드 직후 카풀 만들기 사용을 위해서..

})
.controller("WriteFormCtrl", function($scope, AjaxService, UtilService, MapService){

	$scope.MapService = MapService;
	
	// input에 대한 model
	$scope.formData = {
		numberOfPersons: 4,
		arrivePoint: "",
		startPoint: "",
		carType: "",
		carpoolTime: "",
		startLatitude: "",
		startLongitude: ""
	};
	// 수정모드 여부
	$scope.isModifyMode = false;
	// location.search 파싱 결과
	$scope.queryString = {};
	
	// 카풀 정보 로드
	$scope.loadCarpool = function(){
		AjaxService.selectCarpoolDetail($scope.queryString.boardid).then(
			function(response){
				$scope.formData = UtilService.carpoolDataProc(response.board);
				$scope.formData.carpoolTime = UtilService.ms2foramttedTime($scope.formData.carpoolTime);
				$scope.setStartPosAddr($scope.formData.startLatitude, $scope.formData.startLongitude);
				MapService.moveMarker($scope.formData.startLatitude, $scope.formData.startLongitude);	// 지도 marker 이동
			}
		);
	}
	
	// 카풀 등록
	$scope.addCarpool = function(){
		for(var key in $scope.formData){
			if($scope.formData[key] != null && $scope.formData[key].length == 0){
				alert("필수 항목이 비어있습니다!");
				return false;
			}
		}
		
		AjaxService.insertCarpool($scope.formData).then(
			function(response){
				console.log("#");
			}
		);
	}
	
	// 카풀 수정
	$scope.modifyCarpool = function(){
		for(var key in $scope.formData){
			if($scope.formData[key] != null && $scope.formData[key].length == 0){
				alert("필수 항목이 비어있습니다!");
				return false;
			}
		}
		
		AjaxService.updateCarpool($scope.formData).then(
			function(response){
				$scope.goToList();
			}
		);
	}
	
	// 카풀 삭제
	$scope.deleteCarpool = function(){
		var answer = confirm("정말 삭제합니까?");
		if(answer){
			AjaxService.deleteCarpool($scope.queryString.boardid).then(
				function(response){
					$scope.goToList();
				}
			);
		}
	}
	
	// 카풀 목록 페이지로 이동
	$scope.goToList = function(){
		window.location.href = "./carpool.html";
	}
	
	// 지도 설정 완료
	$scope.setCarpoolPos = function(){
		$scope.formData.startLatitude = MapService.map.marker.getPosition().getLat();
		$scope.formData.startLongitude = MapService.map.marker.getPosition().getLng();
		$scope.setStartPosAddr($scope.formData.startLatitude, $scope.formData.startLongitude);
	}
	
	// model에 변환된 주소값을 저장한다.
	$scope.setStartPosAddr = function(lat, lng){
		MapService.coord2addr(lat, lng).then(
			function(response){
				$scope.formData.startPosAddr = response[0].fullName;
			}
		);
	}
	
	// location.search 파싱 후 저장
	var parseSearch = function(){
		var uri = location.search;
		var queryString = {};
		uri.replace(
			new RegExp("([^?=&]+)(=([^&]*))?", "g"),
			function($0, $1, $2, $3) { queryString[$1] = unescape($3)}
		);
		$scope.queryString = queryString;
	}
	
	// initialize
	// location.search 파싱 후
	// 카풀 수정 요청이라면 카풀정보를 요청, 출력한다.
	parseSearch();
	if(typeof $scope.queryString.boardid !== "undefined"){
		$scope.isModifyMode = true;
		$scope.loadCarpool();
	}
	// '카풀 만들기'를 통해 넘어온 경우라면 form model을 url parameter로 대체한다.
	else if(typeof $scope.queryString.carpoolTime != "undefined"){
		angular.extend($scope.formData, $scope.queryString);
	}
});

// map module
module.service("MapService", function($rootScope, $q){

	// 좌표 변환
	var geocoder = new daum.maps.services.Geocoder();
	// 지도 정보
	this.map = {};
	
	// 지도 초기화
	this.init = function(element, lat, lng){
		if(typeof daum != "undefined"){
			var startPoint = new daum.maps.LatLng(lat, lng);
			var mapOption = {
					center: startPoint,
					draggable: false,
					level: 3
			}
			this.map.map = new daum.maps.Map(element, mapOption);
			this.map.marker = new daum.maps.Marker({
				position: startPoint
			});
			this.map.marker.setMap(this.map.map);
			this.map.marker.setDraggable(true);
		}
	};
	
	// marker 이동
	this.moveMarker = function(lat, lng){
		var pos = new daum.maps.LatLng(lat, lng);
		this.map.map.setCenter(pos);
		this.map.marker.setPosition(pos);
	}
	
	// 좌표 -> 주소 변환
	// daum map api service
	// return deferred
	this.coord2addr = function(lat, lng){
		var deferred = $q.defer();
		geocoder.coord2addr(new daum.maps.LatLng(lat,lng), function(status, result){
			deferred.resolve(result);
		});
		return deferred.promise;
	}
})
.directive("map", function($compile, MapService){
	return {
		link: function(scope, element, attrs){
			MapService.init(element[0], 130.1123, 150);
		}
	}
})
.directive("mapcontainer", function($compile, MapService){
	var contmap = document.querySelector("#carpoolmap");
	return {
		link: function(scope, element, attrs){
			if(scope.$parent.cidx == scope.$index){
				element.append(contmap);
				MapService.map.map.relayout();
				MapService.map.marker.setPosition(MapService.map.map.getCenter());
			}
		}
	}
});

})(window);