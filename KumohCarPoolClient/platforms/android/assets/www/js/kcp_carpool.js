(function(window, KCP) {
"use strict"

/////////////////////
var cpl = angular.module("cpl", []);

// 메뉴 서비스. 모달과 메뉴의 출력 및 닫기 기능을 지원한다.
cpl.service("menuStatus", function($rootScope){
	this.menu = false;	// 메뉴 show/hide
	var modal = "";		// 출력할 모달 이름. 빈 문자열시 아무것도 열지 않는 것으로 한다.
	
	// 특정 모달이 열려있는지 여부를 반환한다.
	// 인자가 없으면 아무 모달이라도 열려있는지 여부를 반환한다.
	// type: 모달 이름
	this.modal = function(type){
		return typeof type != "undefined" ? type == modal : modal != "";
	}
	// 모달의 타입과는 상관없이 닫는다.
	// 닫은 후 rootScope를 통해 모달이 닫혔음을 broadcast 한다.
	this.closeModal = function(){
		var type = modal;
		modal = "";
		$rootScope.$broadcast("onPostCloseModal", type);
	}
	// 특정 모달을 연다. 추가적으로 메뉴를 닫는다.
	// rootScope를 통해 모달이 열렸음을 broadcast 한다.
	// type: 모달 이름
	this.openModal = function(type){
		$rootScope.$broadcast("onPreOpenModal", type);
		modal = type;
		this.menu = false;
	}
});

// 카풀목록 컨트롤러
cpl.controller("CarpoolListController", function($scope, $http){

	$scope.carpools = [];	// 카풀목록 데이터
	$scope.cidx = -1;		// 현재 상세보기 중인 index
	$scope.map = {};		// 맵 관련 정보 모음
	var pgn = 0;
	
	// 10미만 정수를 받아 2자리 수로 변환하여 반환한다.
	// 반환된 값은 문자열로 타입변경 된다.
	var addZero = function(n){
		return n < 10 ? '0' + n : '' + n;
	}
	
	// 카풀 모델을 재가공한다.
	// 카풀 시간 출력을 위한 formattedDate를 모델에 추가한다.
	var carpoolDataProc = function(arr){
		var time = new Date(arr.carpoolTime);
		arr.formattedTime = addZero(time.getHours()) + ":" + addZero(time.getMinutes());
		return arr;
	}
	
	// 카풀에 사용할 지도를 초기화 시킨다.
	var initMap = function(){
		$scope.map.cont = angular.element(document.querySelector("#carpoolmap")).remove();
		if($scope.map.cont != null && typeof daum != "undefined"){
			var startPoint = new daum.maps.LatLng(36.1425305, 128.394327),
				mapOption = {
					center: startPoint,
					draggable: false,
					level: 3
			}
			$scope.map.map = new daum.maps.Map($scope.map.cont[0], mapOption);
			$scope.map.marker = new daum.maps.Marker({
				position: startPoint
			});
			$scope.map.relayout = function(){
				this.map.relayout();
			}
			$scope.map.marker.setMap($scope.map.map);
			$scope.map.marker.setDraggable(false);
		}
	}
	
	// 카풀 목록 상세보기를 토글한다.
	// ng-show로 토글하며, 카풀의 index를 저장하여 해당 카풀을 출력한다.
	// 같은 카풀을 선택하면 모두 감춘다.
	$scope.toggleDetail = function(i){
		if($scope.cidx == i)
			$scope.cidx = -1;
		else
			$scope.cidx = i;
	}
	
	// 상세보기 출력시 서버로부터 정보를 다시 얻는다.
	// 맵을 출력한다.
	// $event: ng-click event handler
	// i: ng-repeat index
	$scope.readmore = function($event, i){
		if($scope.cidx == i){
			$http({
				url: KCP.domain + "/carpoolboard/getBoard.do",
				method: "post",
				params: {
					"cpBoardId": $scope.carpools[i].cpBoardId,
					"userId": KCP.deviceid
				}
			}).success(
				function(response){
					if(response){
						$scope.carpools[i] = carpoolDataProc(response.board);
						$scope.carpools[i].comments = response.comments;
						$scope.carpools[i].permission = response.permission;
					}
				}
			);
		}
	}
	
	// 서버로부터 카풀 목록을 얻어 카풀 목록 데이터에 추가한다.
	// 얻은 수 만큼 페이지인덱스를 증가 시킨다.
	$scope.loadmore = function(){
		$http({
			url: KCP.domain + "/carpoolboard/getList.do",
			method: "post",
			params: {
				"pageIndex": pgn,
				"pageNumber": 3
			}
		}).success(
			function(response){
				if(response){
					pgn += response.lists.length;
					for(var i in response.lists){
						carpoolDataProc(response.lists[i]);
					}
					$scope.carpools.push.apply($scope.carpools, response.lists);
				}
		});
	}
	
	// 서버에 카풀 참여 요청을 한다.
	// 참여 후 permission 정보를 변경한다.
	$scope.requestCarpoolAttend = function(i){
		$http({
			url: KCP.domain + "/carpoolboard/attend.do",
			method: "post",
			params: {
				"cpBoardId": $scope.carpools[i].cpBoardId,
				"userId": KCP.deviceid
			}
		}).success(
			function(response){
				if(response.res){
					$scope.carpools[i].currentPersons = response.currentPersons;
					$scope.carpools[i].permission.isAttendant = true;
					alert("해당 카풀에 참여했습니다!");
				}else{
					alert("더 이상 참여할 수 없습니다.");
				}
			}
		).error(
			function(){
				alert("참여할 수 없습니다.");
		});
	}
	
	// 서버에 카풀 취소 요청을 한다.
	// 취소 후 permission 정보를 변경한다.
	$scope.requestCarpoolCancel = function(i){
		$http({
			url: KCP.domain + "/carpoolboard/cancel.do",
			method: "post",
			params: {
				"cpBoardId": $scope.carpools[i].cpBoardId,
				"userId": KCP.deviceid
			}
		}).success(
			function(response){
				if(response.res){
					$scope.carpools[i].currentPersons = response.currentPersons;
					$scope.carpools[i].permission.isAttendant = false;
					alert("해당 카풀 참여를 취소했습니다.");
				}
			}
		);
	}
	
	// 컨트롤러 시작 시 맵 초기화와 카풀목록을 불러온다.
	initMap();
	$scope.loadmore();
});

// 글로벌메뉴 컨트롤러
cpl.controller("GnbCtrl", function($scope, menuStatus){
	$scope.menuStatus = menuStatus;
});

// 사이드메뉴 컨트롤러
cpl.controller("SnbCtrl", function($scope, menuStatus){
	$scope.menuStatus = menuStatus;
});

// 전체 모달 상위 컨트롤러
cpl.controller("ModalCtrl", function($scope, menuStatus){
	$scope.menuStatus = menuStatus;
});

// 메시지 모달 컨트롤러
cpl.controller("ModalMsgCtrl", function($scope, $http, menuStatus){
	$scope.menuStatus = menuStatus;
	$scope.messages = [];
	
	// 모달이 열렸다는 broadcast를 받는다.
	// 메시지 모달이라면 서버로부터 메시지 목록을 요청한다.
	$scope.$on("onPreOpenModal", function(event, type){
		if(type == "msg")
			$scope.loadMessages();
	});
	
	// 서버로부터 메시지 목록을 받아 모델에 저장한다.
	// 페이지네이션 하지 않으므로 덮어 씌운다.
	$scope.loadMessages = function(){
		$http({
			url: KCP.domain + "/message/getMessage.do",
			method: "post",
			params: {
				"userId": KCP.deviceid
			}
		}).success(
			function(response){
				if(response){
					$scope.messages = response.messageList;
				}
			}
		);
	}
});

cpl.controller("ModalDestCtrl", function($scope, $http, menuStatus){
	$scope.menuStatus = menuStatus;
	$scope.data = {};
	
	// 모달이 닫혔다는 broadcast를 받는다.
	// 목적지 모달이고 푸쉬 ON이라면 서버에 알람 설정을 요청한다.
	$scope.$on("onPostCloseModal", function(event, type){
		if(type == "dest"){
			$http({
				url: KCP.domain + "/destination/add.do",
				method: "post",
				params: {
					"userId": KCP.deviceid
				}
			}).success(
			);
		}
	});
	
	// 서버로부터 목적지 정보를 받는다.
	function loadDestinationInfo(){
		$http({
			url: KCP.domain + "/destination/select.do",
			method: "post",
			params: {
				"userId": KCP.deviceid
			}
		}).success(
			function(response){
				if(response){
					$scope.destination = response.destination;
				}
			}
		);
	}
	
	loadDestinationInfo();
});

// 맵 컨테이너 지시자
// 맵 컨테이너 출력시 맵 DOM을 해당 컨테이너로 가져온다.
cpl.directive("mapcontainer", function(){
	return {
		link: function(scope, element, attrs){
			if(scope.$parent.cidx == scope.$index){
				element.append(scope.$parent.map.cont);
				if(typeof scope.$parent.map.layout != "undefined")
					scope.$parent.map.relayout();
			}
		}
	}
});

})(window, KCP);