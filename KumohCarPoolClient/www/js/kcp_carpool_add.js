(function(e) {
(function($) {
	"use strict"
	
	/* global variables */
	var defaults = {
		urlCarpoolList:		"./carpool.html",			// 카풀목록 페이지 URL
	}
	var globals = {
		id:					KCP.deviceid,				// 사용자 ID
		domain:				KCP.domain,					// 서버 URL
		isModifyMode:		false,						// 수정모드 여부
		modifyId:			-1,							// 수정 중인 게시글 ID
		carpoolTime:		null,						// 페이지 로드 시 카풀시간 초기값
		startPoint:			null,						// 페이지 로드 시 출발지 초기값
		arrivePoint:		null,						// 페이지 로드 시 도착지 초기값
	}
	
	/* functions */
	// 카풀 위치 선택 완료시
	// 선택되었으면 위치의 주소 출력, 아니라면 '클릭해서 위치 지정'
	var checkMapSelected = function(){
		var lat = $("#carpoolPos").data("lat");
		var lng = $("#carpoolPos").data("lng");
		$("[name=startLatitude]").val(lat);
		$("[name=startLongitude]").val(lng);
		if(typeof lat !== "undefined" && typeof lng !== "undefined"){
			var geocoder = new daum.maps.services.Geocoder();
			var latlng = new daum.maps.LatLng(lat, lng);
			geocoder.coord2addr(latlng, function(status, result){
				$("#carpoolPos").attr("placeholder", result[0].fullName);
			});
		}else{
			$("#carpoolPos").attr("placeholder", "클릭해서 위치 지정");
		}
	}
	// 게시글 정보 출력
	var printData = function(data, map, marker){
		var $date = $("#inpDate");
		var $carinfo = $("#inpCarinfo");
		var $persons = $("#inpPersons");
		var $subject = $("#inpSubject");
		var date = new Date(data.carpoolTime);
		var addZero = function(n){
			return n < 10 ? '0' + n : '' + n;
		}
		var dateFormatted = date.getFullYear() + "-" + addZero(date.getMonth()+1) + "-" + addZero(date.getDate()) + " " + addZero(date.getHours()) + ":" + addZero(date.getMinutes());
		$date.val(dateFormatted);
		$carinfo.val(data.carType);
		$persons.val(data.numberOfPersons);
		$subject.val(data.contents);
		// 출발지, 목적지
		$("#inpRouteSrc").val(data.startPoint);
		$("#inpRouteDest").val(data.arrivePoint);
		// 지도
		var carpoolPos = new daum.maps.LatLng(data.startLatitude, data.startLongitude);
		$("#carpoolPos").data("lat", data.startLatitude);
		$("#carpoolPos").data("lng", data.startLongitude);
		map.setCenter(carpoolPos);
		marker.setPosition(carpoolPos);
		checkMapSelected();
	}
	// 일반 등록 모드
	var plainMode = function(){
		// 수정버튼 감춤
		$("#btnModify").hide();
		// 초기값 설정
		if(globals.carpoolTime)
			$("#inpDate").val(globals.carpoolTime);
		if(globals.startPoint && globals.arrivePoint){
			$("#inpRouteSrc").val(globals.startPoint);
			$("#inpRouteDest").val(globals.arrivePoint);
		}
	}
	// 수정 모드
	var modifyMode = function(){
		$.ajax({
			url	: globals.domain+"/carpoolboard/getBoard.do",
			data: {
				"cpBoardId": globals.modifyId,
				"userId": KCP.deviceid
			},
			type: "post",
			success: function(response){
				printData(response.board, map, marker);
			},
			error: function(){
				alert("게시글 수정 에러!");
				window.location.replace(defaults.urlCarpoolList);
			}
		});
		$("#btnAdd").hide();
	}
	// 카풀 등록 또는 수정
	// form
	//  submit을 수행하는 form element
	var addOrModifyCarpool = function(form){
		var carpoolData = $(form).serialize() + "&userId=" + KCP.deviceid;
		var serverUrl = globals.domain;
		if(globals.isModifyMode){
			carpoolData += "&cpBoardId="+globals.modifyId;
			serverUrl += "/carpoolboard/updateBoard.do";
		}else{
			serverUrl += "/carpoolboard/insertBoard.do";
		}
		$.ajax({
			url	: serverUrl,
			type: "post",
			data: carpoolData,
			success: function(response){
				window.location.replace(defaults.urlCarpoolList);
			},
			error: function(){
			}
		});
	}
	// location.search 파싱 및 저장
	var parseSearch = function(){
		// 파싱
		var uri = location.search;
		var queryString = {};
		uri.replace(
			new RegExp("([^?=&]+)(=([^&]*))?", "g"),
			function($0, $1, $2, $3) { queryString[$1] = unescape($3)}
		);
		// 저장
		$.extend(true, globals, queryString);
		if(queryString.modifyId > 0){
			globals.isModifyMode = true;
		}
	}
	// 리스트로 돌아가기
	// 수정 모드인 경우 파라미터를 포함 시킴
	var redirectToList = function(){
		window.history.back();
	}
	// 지도 갱신을 통해 오출력 방지
	var refreshMap = function(){
		map.relayout();
		map.setCenter(marker.getPosition());
	}
	
	/* event binding */
	// 폼 submit
	$("form").on("submit", function(e){
		e.preventDefault();
		addOrModifyCarpool(this);
	});
	// 취소 버튼 클릭
	$("#btnCancel").on("click", function(){
		redirectToList();
	});
	// 맵 메뉴 버튼
	$("#mapDone").on("click", function(){
		var lat = marker.getPosition().getLat();
		var lng = marker.getPosition().getLng();
		$("#carpoolPos").data("lat", lat);
		$("#carpoolPos").data("lng", lng);
		$("#modalMap").parent(".curtain").click();
		checkMapSelected();
	});
	$("#mapKit").on("click", function(){
		marker.setPosition(startPos);
		map.setCenter(startPos);
	});
	$("#mapTaegu").on("click", function(){
		marker.setPosition(taeguPos);
		map.setCenter(taeguPos);
	});
	$("#mapOk").on("click", function(){
		marker.setPosition(okPos);
		map.setCenter(okPos);
	});
	
	/* initialize */
	// DateTimePicker
	$("#dtBox").DateTimePicker({
		formatHumanDate: function(date){
			return "(" + date.dayShort + ") " + date.yyyy + "-" + date.month + "-" + date.dd;
		},
		dateTimeFormat: "yyyy-MM-dd HH:mm:ss",
		titleContentDateTime: "",
		setButtonContent: "설정",
		buttonsToDisplay: ["SetButton"],
		fullMonthNames: ["1", "2", "3", "4", "5", "6", "7", "8", "9", "10", "11", "12"],
		shortMonthNames: ["1", "2", "3", "4", "5", "6", "7", "8", "9", "10", "11", "12"],
		shortDayNames: ["일", "월", "화", "수", "목", "금", "토"],
	});
	// daum map api
	var mapContainer = document.getElementById("map");
	var startPos = new daum.maps.LatLng(36.1425305, 128.394327);
	var taeguPos = new daum.maps.LatLng(35.870913, 128.593993);
	var okPos = new daum.maps.LatLng(36.1368618, 128.4118315);
	var mapOption = {
		center: startPos,
		level: 3,
		draggable: true
	};
	var map = new daum.maps.Map(mapContainer, mapOption);
	var marker = new daum.maps.Marker({
		position: startPos
	});
	marker.setMap(map);
	marker.setDraggable(true);
	// modal
	$("#carpoolPos").modal({
		"target": "#modalMap",
		"onPostOpenModal": refreshMap
	});
	// 파라미터 정보 저장
	parseSearch();
	// 수정 모드
	if(globals.isModifyMode){
		modifyMode();
	}else{
		plainMode();
	}
	
})(jQuery);
}).call(this);