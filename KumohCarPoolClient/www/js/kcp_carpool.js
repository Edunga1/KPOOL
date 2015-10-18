(function(e) {
(function($) {
	"use strict"
	
	/* global variables */
	var defaults = {
		loadDelay:			500,						// 로드 딜레이
		nBottomGap:			0,							// 스크롤바가 최하단인지 확인할 때 여유간격
		pageNums:			5,							// 로드 할 카풀 수
		urlCarpoolList:		"./carpool.html",			// 카풀목록 페이지 URL
		urlCarpoolAdd:		"./carpool_add.html",		// 카풀등록 페이지 URL
		domain:				KCP.domain,					// 서버 URL
	}
	var globals = {
		timecuts:			new Array(),				// 시간 경계선 목록
		pgn:				0,							// 로드할 게시글 인덱스(pagination)
		isLoading:			false,						// 현재 로드중인지 여부
		latestLoadTime:		new Date(0),				// 최근의 로드시간
		currBoardId:		-1,							// 현재 읽고있는 게시글 id
		isActiveLoadmore:	true,						// 더 보기 허용여부
		isMyCarpoolMode:	false,						// 내 카풀보기 모드 여부
		map:				null,						// daum map
		marker:				null,						// daum map marker
		userDestTime:		"",							// 사용자 목적지설정 시간
		userDestStart:		"",							// 사용자 목적지설정 출발지
		userDestArrive:		"",							// 사용자 목적지설정 도착지
		nDateBottom:			0,						// 상단 날짜 컨테이너 bottom
	}
	/* functions */
	// 게시글 로드
	var loadmore = function(){
		// 로딩 중이거나, 더 보기가 준비되지 않았거나, 더 보기 허용을 하지 않았으면 종료
		if(globals.isLoading || !isLoadReady() || !globals.isActiveLoadmore)
			return false;
		globals.isLoading = true;
		/* 로딩 보류 */
		// $("#contBoardBottom").loading(true);
		$.ajax({
			url: defaults.domain+"/carpoolboard/getList.do",
			type: "post",
			data: {
				"pageIndex": globals.pgn,
				"pageNumber": defaults.pageNums
			},
			success: function(response){
				// 로드한 게시글 붙임
				globals.isLoading = false;
				globals.latestLoadTime = new Date();
				printCarpoolList(response.lists);
				// 타임바 갱신
				refreshContDate();
			},
			error: function(){
				globals.isLoading = false;
				globals.latestLoadTime = new Date();
			},
			complete: function(){
				/* @TEST 로딩 보류 */
				// $("#contBoardBottom").loading(false);
			}
		});
	}
	// 상단 시간바 갱신
	var refreshContDate = function(sctop){
		var $timeCuts = $(".time_cut");
		if($timeCuts.length == 0)
			return false;
		var time = $timeCuts[0].innerHTML;
		$timeCuts.each(function(idx){
			if(idx == 0) return true;
			if($(this).offset().top > globals.nDateBottom)
				return false;
			time = this.innerHTML;
		});
		$("#nowPosTime").text(time);
	}
	// 메시지 모달 내 탭 이동
	var messageModalTabToggle = function(e){
		// 탭 effect
		$("#modalDestination .active").removeClass("active");
		$(e.delegateTarget).addClass("active");
		// 탭에 해당하는 컨테이너 토글
		$("#tabDestSetup, #tabMatching").each(function(){
			if($(this).hasClass("active"))
				$($(this).data("target")).show();
			else
				$($(this).data("target")).hide();
		});
	}
	// 알람 토글
	// element
	//  아이콘 element
	var toggleAlarm = function(element){
		if($(element).hasClass("ico_bell")){
			$(element).removeClass("ico_bell").addClass("ico_bell-s");
		}else{
			$(element).removeClass("ico_bell-s").addClass("ico_bell");
		}
	}
	// 스크롤이 최하단에 있는 경우 게시글 추가 로드
	var loadmoreWhenScrollBottom = function(){
		var $box = $("#boxListCarpool");
		var endpoint = $box.height() + $box.scrollTop() + defaults.nBottomGap;
		if(endpoint >= $box.prop("scrollHeight")){
			loadmore();
		}
	}
	// 게시글 로드 준비가 되었는지 여부
	// 마지막 게시글 로드 시간과 비교하여 지정한 시간이 지났는지 확인
	var isLoadReady = function(){
		var now = new Date();
		var diff = now.getTime() - globals.latestLoadTime.getTime();
		if(diff >= defaults.loadDelay){
			return true;
		}
		return false;
	}
	// 카풀 목록 출력
	// data
	//  카풀 게시글 목록 Json
	var printCarpoolList = function(data){
		if(data.length == 0)
			return;
		var addZero = function(n){
			return n < 10 ? '0' + n : '' + n;
		}
		globals.pgn += data.length;
		var liSet = "";
		var prevYear = 0;
		var prevMonth = 0;
		var prevDate = 0;
		for(var i in data){
			var d = data[i];
			var time = new Date(d.carpoolTime);
			var formattedTime = addZero(time.getHours()) + ":" + addZero(time.getMinutes());
			var isAddTimecut = true;
			// 날짜
			if(i == 0){
				$("#listCarpool .time_cut").each(function(){
					if($(this).data("year") == time.getYear() &&
					   $(this).data("month") == time.getMonth() &&
					   $(this).data("date") == time.getDate()){
						isAddTimecut = false;
						return false;
					}
				});
			}else{
				if(prevYear == time.getYear() &&
				   prevMonth == time.getMonth() &&
				   prevDate == time.getDate()){
						isAddTimecut = false;
				}
			}
			if(isAddTimecut){
				var liTimecut = $("<li />", {
					"class":	"timeline_hr timeline_bar time_cut",
					"text":		time.getMonth()+1 + "/" + time.getDate(),
					"data-year":time.getYear(),
					"data-month":time.getMonth(),
					"data-date":time.getDate()
				});
				liSet += liTimecut.prop("outerHTML");
				prevYear = time.getYear();
				prevMonth = time.getMonth();
				prevDate = time.getDate();
			}
			// 게시글
			var liPost = $("<li />", {
				"class":	"post",
				"html":		function(){
					return "" +
						"<div class='box_time'>" +
							formattedTime +
						"</div>" +
						"<div class='box_post'>" +
							"<input class='cpBoardId' type='hidden' value='"+d.cpBoardId+"'>" +
							"<div class='"+(d.commentNums==0?"box_subject no_cmt":"box_subject")+"'>" +
								"<span class='txt_dest'>"+d.arrivePoint+"</span>" +
								"<span class='txt_subject'>"+d.contents+"</span>" +
							"</div>" +
							(d.commentNums>0?
							"<div class='box_cmt_num'>" +
								"<span class='ico ico_comment'></span>" +
								"<span class='num_comments'>"+(d.commentNums>9?"9+":+d.commentNums)+"</span>" +
							"</div>":"") +
						"</div>" +
						"<div class='box_status'>" +
							"<div class='"+(d.numberOfPersons<=d.currentPersons?"ico_status full":"ico_status")+"'>" +
						"</div>";
				}
			});
			liSet += liPost.prop("outerHTML");
		}
		$("#listCarpool").append(liSet);
	}
	// 덧글 출력
	// comments
	//  코멘트 정보 JSON
	var printComments = function(comments){
		$("#listComments").empty();
		var liSet = "";
		for(var i=0; i<comments.length; i++){
			var li = $("<li />", {
				"class": "row"
			});
			var spanComment = $("<div />", {
				"class": "col_10 box_cmt_contents",
				text: comments[i].comment
			});
			var spanUser = $("<div />", {
				"class": "col_10 box_cmt_name",
				text: comments[i].user.alias
			});
			if(comments[i].mine){
				spanComment.addClass("mine");
				spanUser.addClass("mine");
			}
			li.html(spanUser.prop("outerHTML")+spanComment.prop("outerHTML"));
			liSet += li.prop("outerHTML");
		}
		$("#listComments").append(liSet);
	}
	// 상세보기 글 내용 출력
	// data
	//  게시글 정보 JSON
	var printData = function(data){
		var addZero = function(n){
			return n < 10 ? '0' + n : '' + n;
		}
		var time = new Date(data.carpoolTime);
		var formattedTime = addZero(time.getMonth()+1) + "-" + addZero(time.getDay()) + "\n" + addZero(time.getHours()) + ":" + addZero(time.getMinutes());
		$("#detailArrivePoint").text(data.arrivePoint);
		$("#detailStartPoint").text(data.startPoint);
		$("#detailContents").text(data.contents);
		$("#detailCarType").text(data.carType);
		/* @TEST 카풀시간 제거 되었음. 수정 후 셀렉터 변경 */
		//$("#detailCarpoolTime").text(formattedTime);
		// 참여자 수
		var curr = data.currentPersons;
		var max = data.numberOfPersons;
		var $attenders = $("#detailAttenders").empty();
		for(var i=0; i<max; i++){
			var icon = $("<i />", {
				"class": "ico ico_user"
			});
			if(i < curr)
				icon.addClass("active");
			$attenders.append(icon);
		}
		// 지도 출력
		var latlng = new daum.maps.LatLng(data.startLatitude, data.startLongitude);
		globals.map.setCenter(latlng);
		globals.marker.setPosition(latlng);
		var geocoder = new daum.maps.services.Geocoder();
		geocoder.coord2addr(latlng, function(status, result){
			$("#carpoolAddr").text(result[0].fullName);
		});
	}
	// 상세보기
	var readmore = function(){
		// 권한에 따라 버튼을 숨기고 감춤
		var btnsh = function(permission){
			var isWriter = permission.isWriter;
			var isAttendant = permission.isAttendant;
			var $btnDelete = $("#btnDelete").parent();
			var $btnCancel = $("#btnCancel").parent();
			var $btnCarpool = $("#btnAttend").parent();
			var $btnModify = $("#btnModify").parent();
			if(isWriter){
				$btnDelete.show();
				$btnModify.show();
				$btnCancel.hide();
				$btnCarpool.hide();
			}else if(isAttendant){
				$btnDelete.hide();
				$btnModify.hide();
				$btnCancel.show();
				$btnCarpool.hide();
			}else{
				$btnDelete.hide();
				$btnModify.hide();
				$btnCancel.hide();
				$btnCarpool.show();
			}
		}
		// 글 정보와 내용 비동기 호출 완료시 내용 출력
		$.ajax({
			url: defaults.domain+"/carpoolboard/getBoard.do",
			data: {
				"cpBoardId": globals.currBoardId,
				"userId": KCP.deviceid
			},
			type: "post",
			success: function(response){
				btnsh(response.permission);
				printData(response.board);
				printComments(response.comments);
			}
		});
	}
	// 리스트 -> 상세보기 전환
	// isIgnoreAnimate
	//  true: 애니메이션 생략, false: 애니메이션 효과
	var listToDetail = function(isIgnoreAnimate){
		if(isIgnoreAnimate){
			$("#boardContent").css("right", "100%");
			$("#detailContent").css("left", "0%");
			$("body").css("overflow", "hidden");
		}else{
			$("#boardContent").animate({
				"right": "100%"
			});
			$("#detailContent").animate({
				"left": "0%"
			});
			$("body").css({
				"overflow": "hidden"
			});
		}
	}
	// 상세보기 -> 리스트 전환
	var detailToList = function(){
		$("#boardContent").animate({
			"right": "0%"
		});
		$("#detailContent").animate({
			"left": "100%"
		});
		$("body").css({
			"overflow": ""
		});
	}
	// 서버에 카풀 참여 요청
	var requestCarpoolAttend = function(){
		$.ajax({
			url: defaults.domain+"/carpoolboard/attend.do",
			type: "post",
			data: {
				"cpBoardId": globals.currBoardId,
				"userId": KCP.deviceid
			},
			success: function(response){
				if(response.res){
					var nCurr = response.currentPersons;
					$("#btnAttend").parent().hide();
					$("#btnCancel").parent().show();
					$("#detailAttenders .active").removeClass("active");
					$("#detailAttenders .ico_user:lt("+nCurr+")").addClass("active");
				}else{
					alert("더 이상 참여할 수 없습니다.");
				}
			},
			error: function(){
				alert("참여할 수 없습니다.");
			}
		});
	}
	// 서버에 카풀 취소 요청
	var requestCarpoolCancel = function(){
		$.ajax({
			url: defaults.domain+"/carpoolboard/cancel.do",
			type: "post",
			data: {
				"cpBoardId": globals.currBoardId,
				"userId": KCP.deviceid
			},
			success: function(response){
				if(response.res){
					var nCurr = response.currentPersons;
					$("#btnCancel").parent().hide();
					$("#btnAttend").parent().show();
					$("#detailAttenders .active").removeClass("active");
					$("#detailAttenders .ico_user:lt("+nCurr+")").addClass("active");
				}
			},
			error: function(){
			}
		});
	}
	// 카풀 수정 페이지로 이동
	var redirectToCarpoolModify = function(){
		// 카풀 목록, 보고있는 내용, 스크롤 위치 저장 후 redirect
		var url = defaults.urlCarpoolAdd+"?modifyId="+escape(globals.currBoardId);
		document.location.hash = "#"+globals.currBoardId;
		storageBoardState();
		window.location.href = url;
	}
	// 카풀 등록 페이지로 이동
	var redirectToCarpoolAdd = function(){
		if(!(globals.userDestTime || globals.userDestStart || globals.userDestArrive))
			return false;
		var url = defaults.urlCarpoolAdd+"?carpoolTime="+escape(globals.userDestTime)
										+"&startPoint="+escape(globals.userDestStart)
										+"&arrivePoint="+escape(globals.userDestArrive);
		window.location.href = url;
	}
	// 서버에 목적지 설정 요청
	var requestSetDestination = function(element){
		var isOn = $("#cbAlarmToggle").is(":checked");
		if(isOn){
			$.ajax({
				url: defaults.domain+"/destination/add.do",
				type: "post",
				data: {
					userId: KCP.deviceid,
					regId: KCP.regid,
					startPoint: $("#setSrc").val(),
					arrivePoint: $("#setDest").val(),
					carpoolTime: $("#setTime").val()
				}
			});
		}else{
			$.ajax({
				url: defaults.domain+"/destination/delete.do",
				type: "post",
				data: {
					userId: KCP.deviceid
				}
			});
		}
		$("#modalDestSetup").parent(".curtain").click();
	}
	// 카풀 삭제
	var deleteCarpool = function(){
		$.ajax({
			url: defaults.domain+"/carpoolboard/deleteBoard.do",
			type: "post",
			data: {
				"cpBoardId": globals.currBoardId,
				"userId": KCP.deviceid
			},
			success: function(response){
				if(response.res){
					window.location.href = defaults.urlCarpoolList;
				}else{
					alert("삭제 실패!");
				}
			},
			error: function(){
			}
		});
	}
	// 덧글 등록 및 갱신된 덧글 가져오기
	var postComment = function(){
		// 등록정보 획득
		var comment = $("#inpCmt").val();
		$("#inpCmt").val("");
		// 예외
		if(comment.length == 0){
			alert("내용을 입력하세요.");
			return false;
		}
		// 등록요청
		$.ajax({
			url: defaults.domain+"/carpoolboard/addComment.do",
			type: "post",
			data: {
				"cpBoardId": globals.currBoardId,
				"userId": KCP.deviceid,
				"comment": comment
			},
			success: function(response){
				console.log(response);
				printComments(response.commentList);
			},
			error: function(){
			}
		});
	}
	// 내 카풀 보기
	var loadMyCarpool = function(){
		globals.isActiveLoadmore = false;
		// 내 카풀보기와 모든 카풀보기의 바꾸고, 링크도 재설정
		var $bmc = $("#btnMyCarpool");
		var $bac = $("#btnAllCarpool");
		var temp = { "id": $bmc.attr("id"), "class": $bmc.attr("class")}
		$bmc.find("a").attr("href", defaults.urlCarpoolList);
		$bmc.attr("id", $bac.attr("id")).attr("class", $bac.attr("class"));
		$bac.attr("id", temp.id).attr("class", temp.class);
		// 정보요청 및 출력
		$.ajax({
			url: defaults.domain+"/carpoolboard/getMyList.do",
			type: "post",
			data: {
				"userId": KCP.deviceid
			},
			success: function(response){
				if(!response.isEmpty){
					// 목록 비움
					$("#listCarpool").empty();
					// 로드한 게시글 붙임
					globals.isLoading = false;
					globals.latestLoadTime = new Date();
					globals.pgn += $(response).find(".box_post").length;
					$("#listCarpool").append(response);
				}
			},
			error: function(){
			}
		});
	}
	// 목적지 정보 가져오기
	var loadDestination = function(){
		var addZero = function(n){
			return n < 10 ? '0' + n : '' + n;
		}
		$.ajax({
			url: defaults.domain+"/destination/select.do",
			type: "post",
			data: {
				"userId": KCP.deviceid
			},
			success: function(response){
				if(response.res){
					// 목적지설정 정보 저장
					var date = new Date(response.destination.carpoolTime);
					var dateFormatted = date.getFullYear() + "-" + addZero(date.getMonth()+1) + "-" + addZero(date.getDate()) + " " + addZero(date.getHours()) + ":" + addZero(date.getMinutes());
					globals.userDestTime = dateFormatted;
					globals.userDestStart = response.destination.startPoint;
					globals.userDestArrive = response.destination.arrivePoint;
					// 출력
					$("#setSrc").val(response.destination.startPoint);
					$("#setDest").val(response.destination.arrivePoint);
					$("#setTime").val(dateFormatted);
					$("#cbAlarmToggle").prop("checked", true);
				}else{
					$("#cbAlarmToggle").prop("checked", false);
				}
			},
			error: function(){
			}
		});
		// 목적지 설정 탭을 시작으로
		$("#tabDestSetup").click();
	}
	// 매칭 결과 가져오기
	var loadMatchingResult = function(){
		$.ajax({
			url: defaults.domain+"/destination/match.do",
			type: "post",
			data: {
				"userId": KCP.deviceid
			},
			success: function(response){
				$("#matchingResult").text(response.message);
				if(response.isMatching)
					$("#btnMRCC").show();
				else
					$("#btnMRCC").hide();
			}
		});
	}
	// 메시지 목록 가져오기
	var loadMessageList = function(){
		$.ajax({
			url: defaults.domain+"/message/getMessage.do",
			type: "post",
			data: {
				"userId": KCP.deviceid
			},
			success: function(response){
				var $list = $("#listMessage").empty();
				var liSet = "";
				for(var i=0; i<response.messageList.length; i++){
					var li = $("<li />", {
						html: response.messageList[i].contents
					});
					liSet += li.prop("outerHTML");
				}
				$list.append(liSet);
			}
		});
	}
	// 카풀목록 불러오기
	// 내 카풀 보기 or 모든 카풀 보기 or 수정화면에서 돌아가기인지 판단
	var loadCarpools = function(){
		if(location.hash.length > 1){
			globals.isActiveLoadmore = false;
			unstorageBoardState();
			globals.isActiveLoadmore = true;
			location.hash = "";
		}else{
			if(globals.isMyCarpoolMode){
				loadMyCarpool();
			}else{
				loadmore();
			}
		}
	}
	// daum map 초기화
	var initDaumMap = function(){
		var startPoint = new daum.maps.LatLng(36.1425305, 128.394327);
		var mapContainer = document.getElementById("map"),
			mapOption = { 
				center: startPoint,
				draggable: false,
				level: 3
			};
		globals.map = new daum.maps.Map(mapContainer, mapOption);
		globals.marker = new daum.maps.Marker({
			position: startPoint
		});
		globals.marker.setMap(globals.map);
		globals.marker.setDraggable(false);
	}
	// 현재 페이지 상태 저장
	var storageBoardState = function(){
		localStorage.setItem("cachedCarpoolList", $("#listCarpool").prop("innerHTML"));
		localStorage.setItem("cachedCarpoolScrollTop", $("#boxListCarpool").scrollTop());
		localStorage.setItem("cachedPgn", globals.pgn);
		localStorage.setItem("cachedCurrBoardId", globals.currBoardId);
	}
	// 저장된 페이지 상태 출력
	var unstorageBoardState = function(){
		if(typeof localStorage.getItem("cachedCarpoolList") != "undefined"){
			$("#listCarpool").empty().append(localStorage.getItem("cachedCarpoolList"));
			$("#boxListCarpool").scrollTop(localStorage.getItem("cachedCarpoolScrollTop"));
			globals.pgn = parseInt(localStorage.getItem("cachedPgn"));
			globals.currBoardId = localStorage.getItem("cachedCurrBoardId");
			// 사용한 데이터 파기
			localStorage.removeItem("cachedCarpoolList");
			localStorage.removeItem("cachedCarpoolScrollTop");
			localStorage.removeItem("cachedPgn");
			localStorage.removeItem("cachedCurrBoardId");
			// 페이지 이동
			listToDetail(true);
			readmore();
		}
	}
	// DOM 정보 설정
	var setDOMInfo = function(){
		var $contDate = $("#contDate");
		globals.nDateBottom = $contDate.offset().top + $contDate.height();
	}
	
	/* event binding */
	// 메세지 모달 탭 클릭
	$("#tabDestSetup, #tabMatching").on("click", function(e){
		if($(this).attr("id") == "tabMatching")
			loadMatchingResult();
		messageModalTabToggle(e);
	});
	// 페이지 스크롤
	$("#boxListCarpool").scroll(function(){
		refreshContDate();
		loadmoreWhenScrollBottom();
	});
	// 메뉴-알람 클릭
	$("#btnAlarm").on("click", function(){
		toggleAlarm(this);
	})
	// 게시글 클릭
	$("#listCarpool").on("click", ".box_post", function(){
		globals.currBoardId = $(this).find(".cpBoardId").val();
		readmore();
		listToDetail(false);
	});
	// 상세보기-돌아가기 클릭
	$("#btnBack").on("click", function(){
		detailToList();
	});
	// 삭제 클릭
	$("#btnDelete").on("click", function(){
		deleteCarpool();
	});
	// 카풀하기 클릭
	$("#btnAttend").on("click", function(){
		requestCarpoolAttend();
	});
	// 카풀취소 클릭
	$("#btnCancel").on("click", function(){
		requestCarpoolCancel();
	});
	// 수정 클릭
	$("#btnModify").on("click", function(){
		redirectToCarpoolModify();
	});
	// 덧글 등록 버튼 클릭
	$("#btnCmt").on("click", function(){
		postComment();
	});
	// location.search 파싱 및 저장
	var parseSearch = function(){
		// 파싱
		var uri = location.search;
		var queryString = {};
		uri.replace(
			new RegExp("([^?=&]+)(=([^&]*))?", "g"),
			function($0, $1, $2, $3) { queryString[$1] = $3}
		);
		// 저장
		if(queryString.my == 1){
			globals.isMyCarpoolMode = true;
		}
	}
	// 알람 토글 체크박스 클릭
	$("#cbAlarmToggle").on("click", function(){
		requestSetDestination();
	});
	// 매칭 결과 - 카풀만들기 버튼 클릭
	$("#btnMRCC").on("click", function(){
		redirectToCarpoolAdd();
	});
	// 페이지 리사이즈
	$(window).on("resize", function(){
		setDOMInfo();
	});
	
	/* initialize */
	// 시작시 목적지설정 탭 클릭
	$("#tabDestSetup").click();
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
		shortDayNames: ["일", "월", "화", "수", "목", "금", "토"]
	});
	// modal, listscroll, loading
	$("#listScroll").listscroll({
		"margin": 30
	});
	$("#btnMessage").modal({
		"target": "#modalMessage",
		"onPreOpenModal": loadMessageList,
	});
	$("#btnDest").modal({
		"target": "#modalDestination",
		"onPreOpenModal": loadDestination
	});
	/*
		@TEST 로딩 보류
	$("#contBoardBottom").loading({
		"onPreShow": function(){
			$("#contBoardBottom").show();
		}
	});
	*/
	// daum map api
	initDaumMap();
	// 파라미터 정보 저장
	parseSearch();
	// 카풀목록 출력
	loadCarpools();
	// DOM 정보 저장
	setDOMInfo();
	
})(jQuery);
}).call(this);