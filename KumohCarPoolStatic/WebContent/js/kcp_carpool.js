/**
*	브라우저에서 테스트
*		KCP.deviceid의 값을 null이 아닌 임의의 값으로 둔다.
*		angularjs 부트스트랩 콜백 이벤트를 deviceready 가 아닌 DOMContentLoaded 로 둔다.
*/
(function(window) {
"use strict"

// 카풀 서버와 디바이스 정보
var KCP = {
	domain:				"http://localhost:8080/KumohCarPool",	// 서버 URL
	deviceid:			"a",									// device id for test
	// deviceid:			null,									// device id
	regid:				null,									// google gcm regid
};

// mobile 뒤로가기 버튼 막음
document.addEventListener("backbutton", function (e){
	var res = confirm("종료하시겠습니까?");
	if(res) navigator.app.exitApp();
}, false);

// device 정보 획득 후 angularjs 부트스트랩
document.addEventListener("DOMContentLoaded", function(){	// for test
// document.addEventListener("deviceready", function(){

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

	// 디바이스 ID 획득
	if(KCP.deviceid == null){
		KCP.deviceid = device.uuid;
	}
	
	// 푸시 정보 획득
	if(typeof device !== "undefined"){
		if(device.platform.toUpperCase() == 'ANDROID'){
			window.plugins.pushNotification.register(function(result){
				console.log("result:" + result);
			}, function(err){
				console.log("error:" + err);
			}, {
				"senderID" : "60318613763",	// Google GCM 서비스에서 생성한 Project Number를 입력한다.
				"ecb" : "onNotificationGCM"	// 디바이스로 푸시가 오면 onNotificationGCM 함수를 실행할 수 있도록 ecb(event callback)에 등록한다.
			});
		}else{
			// PushPlugin을 설치했다면 window.plugins.pushNotification.register를 이용해서 iOS 푸시 서비스를 등록한다.
			window.plugins.pushNotification.register(function(result){
				console.log("deviceToken:" + result);
			}, function(err){
				console.log("error:" + err);
			}, {
				"badge":"true", // 뱃지 기능을 사용한다.
				"sound":"true", // 사운드를 사용한다.
				"alert":"true", // alert를 사용한다.
				"ecb": "onNotificationAPN" // 디바이스로 푸시가 오면 onNotificationAPN 함수를 실행할 수 있도록 ecb(event callback)에 등록한다.
			});
		}
	}
	
	angular.bootstrap(document, ["kcp"]);
}, false);

var module = angular.module("kcp", ["datePicker"])
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
		arr.formattedDay = time.getMonth()+1 + "/" + time.getDate();
		arr.formattedFullDay = time.getFullYear() + " " + arr.formattedDay;
		return arr;
	}
})
.service("MapService", function($rootScope, $q){

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
	
	// 지도 드래그 가능 설정
	// res: true 시 가능, false 시 불가능
	this.setDraggable = function(res){
		this.map.map.setDraggable(false);
		this.map.marker.setDraggable(false);
	}
	
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
.service("AjaxService", function($http, $q){
	
	// 비동기 통신 defer
	// 에러시 상태코드, 성공 시 response 반환
	var ajax = function(url, data){
		var deferred = $q.defer();
		$http({
			url: url,
			method: "post",
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
			KCP.domain+"/carpoolboard/getList.do", {
				"pageIndex": pgn,
				"pageNumber": 3,
				"userId": KCP.deviceid
			}
		);
	}
	
	// 카풀 상세 정보
	// boardid: 카풀 게시글 ID
	this.selectCarpoolDetail = function(boardid){
		return ajax(
			KCP.domain+"/carpoolboard/getBoard.do", {
				"cpBoardId": boardid,
				"userId": KCP.deviceid
			}
		);
	}
	
	// 카풀 등록
	// data: 카풀 정보, 데이터
	this.insertCarpool = function(data){
		data.userId = KCP.deviceid;
		return ajax(
			KCP.domain+"/carpoolboard/insertBoard.do",
			data
		);
	}
	// 카풀 수정
	// data: 카풀 정보, 데이터
	this.updateCarpool = function(data){
		data.userId = KCP.deviceid;
		return ajax(
			KCP.domain+"/carpoolboard/updateBoard.do",
			data
		);
	}
	
	// 카풀 삭제
	// boardid: 카풀 게시글 ID
	this.deleteCarpool = function(boardid){
		return ajax(
			KCP.domain+"/carpoolboard/deleteBoard.do", {
				"cpBoardId": boardid,
				"userId": KCP.deviceid
			}
		);
	}
	
	// 내 카풀 목록
	this.selectMyCarpoolList = function(){
		return ajax(
			KCP.domain+"/carpoolboard/getMyList.do", {
				"userId": KCP.deviceid
			}
		);
	}
	
	// 카풀 참여
	// boardid: 카풀 게시글 ID
	this.attendCarpool = function(boardid){
		return ajax(
			KCP.domain+"/carpoolboard/attend.do", {
				"cpBoardId": boardid,
				"userId": KCP.deviceid
			}
		);
	}
	
	// 카풀 취소
	// boardid: 카풀 게시글 ID
	this.cancelCarpool = function(boardid){
		return ajax(
			KCP.domain+"/carpoolboard/cancel.do", {
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
			KCP.domain+"/carpoolboard/addComment.do", {
				"cpBoardId": boardid,
				"comment": contents,
				"userId": KCP.deviceid
			}
		);
	}
	
	// 목적지 정보
	this.selectDest = function(boardid, contents){
		return ajax(
			KCP.domain+"/destination/select.do", {
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
			KCP.domain+"/destination/add.do", {
				"startPoint": start,
				"arrivePoint": arrive,
				"carpoolTime": time,
				"userId": KCP.deviceid,
				"regId": KCP.regid
			}
		);
	}
	
	// 목적지 정보 삭제
	this.deleteDest = function(){
		return ajax(
			KCP.domain+"/destination/delete.do", {
				"userId": KCP.deviceid
			}
		);
	}
	
	// 메시지 목록
	this.selectMessageList = function(){
		return ajax(
			KCP.domain+"/message/getMessage.do", {
				"userId": KCP.deviceid
			}
		);
	}
	
	// 매칭 정보
	this.selectMatching = function(){
		return ajax(
			KCP.domain+"/destination/match.do", {
				"userId": KCP.deviceid
			}
		);
	}
	
	// 사용자 정보 등록 및 획득
	this.insertUser = function(){
		return ajax(
			KCP.domain+"/carpoolboard/insertUser.do", {
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
		user: {
			alias: "",
			aliasResourceIndex: 1
		}
	}
	
	// 카풀 로드
	$scope.loadmore = function(){
		AjaxService.selectCarpoolList(pgn).then(
			function(response){
				if(response.lists.length > 0){
					pgn += response.lists.length;
					if($scope.isMypool){
						$scope.isMypool = false;
						$scope.models.carpools = [];
					}
					for(var i in response.lists){
						UtilService.carpoolDataProc(response.lists[i]);
					}
					$scope.models.carpools.push.apply($scope.models.carpools, response.lists);
					if($scope.models.carpools.length == response.lists.length){
						$scope.currentDate = $scope.models.carpools[0].formattedFullDay;
					}
				}
			}
		);
	}
	
	// 상세보기
	$scope.readmore = function($event, i){
		AjaxService.selectCarpoolDetail($scope.models.carpools[i].cpBoardId).then(
			function(response){
				$scope.models.carpools[i] = UtilService.carpoolDataProc(response.board);
				$scope.models.carpools[i].comments = response.comments;
			}
		);
	}
	
	// 내 카풀 로드
	// pagination과 카풀 목록 model에 덮어 쓴다.
	$scope.loadMyCarpools = function(){
		AjaxService.selectMyCarpoolList().then(
			function(response){
				if(!response.isEmpty){
					console.log(response);
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
					$scope.models.carpools[i].attend = true;
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
					$scope.models.carpools[i].attend = false;
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
				if(response.res){
					$scope.destForm.$setPristine();		// 변경 내역 초기화
					$scope.models.dest.isExist = true;
				}else{
					$scope.models.dest.startPoint = "";
					$scope.models.dest.arrivePoint = "";
					$scope.models.dest.carpoolTime = "";
				}
			},
			function(response){
				$scope.models.dest.startPoint = "";
				$scope.models.dest.arrivePoint = "";
				$scope.models.dest.carpoolTime = "";
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
		AjaxService.selectMatching().then(
			function(response){
				angular.extend($scope.models.matching, response);
			}
		);
	}
	
	// 사용자 정보 로드
	$scope.loadUser = function(){
		AjaxService.insertUser().then(
			function(response){
				angular.extend($scope.models.user, response.user);
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
	
	// 홈으로, 새로고침을 한 것처럼 카풀을 새로 로드한다.
	$scope.home = function(){
		pgn = 0;
		$scope.models.carpools = [];
		$scope.isMypool = false;
		$scope.loadmore();
	}
	
	// initialize
	$scope.loadDest();	// 로드 직후 카풀 만들기 사용을 위해서..
	$scope.loadUser();// 사용자 등록 및 정보 획득
})
.controller("WriteFormCtrl", function($scope, AjaxService, UtilService, MapService){

	$scope.MapService = MapService;
	$scope.modal = "";
	
	// input에 대한 model
	$scope.formData = {
		numberOfPersons: 4,
		arrivePoint: "",
		startPoint: "",
		carType: "",
		carpoolTime: "",
		startLatitude: "",
		startLongitude: "",
		comment: ""
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
			if(key == "comment")
				continue;
			if($scope.formData[key] != null && $scope.formData[key].length == 0){
				alert("필수 항목이 비어있습니다!");
				return false;
			}
		}
		
		AjaxService.insertCarpool($scope.formData).then(
			function(response){
				$scope.goToList();
			}
		);
	}
	
	// 카풀 수정
	$scope.modifyCarpool = function(){
		for(var key in $scope.formData){
			if(key == "comment")
				continue;
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
})
.directive("map", function($compile, MapService){
	return {
		link: function(scope, element, attrs){
			MapService.init(element[0], 36.1425305, 128.394327);
			if(attrs.mapDraggable == "false")
				MapService.setDraggable(false);
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
})
.directive("listscroll", function($document){
	return {
		link: function(scope, element, attrs){
			var callback = function(){
				var timebars = element[0].getElementsByClassName("box_timebar");
				var prev = timebars[0];
				for(var i=1; i<timebars.length; i++){
					if(timebars[i].offsetTop > element[0].scrollTop)
						break;
					prev = timebars[i];
				}
				scope.currentDate = prev.dataset.date;
			}
			element.bind("scroll", function(){
				callback();
				scope.$apply();
			});
		}
	}
});

})(window);