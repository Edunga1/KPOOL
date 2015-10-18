/**
 * 리스트 스크롤
 * version 0.0.0
 * kcp
 */
(function(e) {
(function($) {
	"use strict";
	
	// 클래스
	var Listscroll = function(element, options){
		
		// member variables
		this.isOpened = false;			// 현재 리스트가 펼쳐져있는지 여부
		this.items = element.find("li");// 아이템 모음
		this.cnt = this.items.length;	// 아이템 수
		this.ih = $(this.items[0]).height();	// 아이템 높이
		
		// caller
		this.element = element;
		
		// set options
		this.setOptions(options);
		
		// event binding
		this.bindEvents();
	}
	
	// 클래스 멤버 함수 정의
	Listscroll.prototype = {
		
		/**
		 * 옵션 설정
		 */
		setOptions: function(options){
			// 기본값
			this.margin = 0;	// 아이템간 간격
			
			// 설정값
			if(typeof options.margin === "number")
				this.margin = options.margin;
		},
		
		/**
		 * 이벤트 부여
		 */
		bindEvents: function(){
			var thisRef = this;
			
			// 마지막 아이템에 이벤트 부여
			this.element.find("li:last").on("click", function(){
				thisRef.toggleList();
			});
		},

		/**
		 * 리스트 펼치기/닫기 토글
		 */
		toggleList: function(){
			if(this.cnt < 0) return;
			
			var thisRef = this;
			
			if(this.isOpened){
				for(var i=1; i<this.cnt; i++){
					$("#listScroll").find("li").animate({
						top: ""
					});
				}
				this.isOpened = false;
			}else{
				for(var i=1; i<this.cnt; i++){
					$("#listScroll").find("li").eq(this.cnt-i-1).animate({
						top: -(this.margin*i+this.ih*i)
					});
				}
				this.isOpened = true;
			}
		},
	}
	
	// 플러그인
	$.fn.listscroll = function(options){
		this.each(function () {
            var el = $(this);
            if (el.data("listscroll"))
                el.data("listscroll").remove();
            el.data("listscroll", new Listscroll(el, options));
        });
        return this;
	}
})(jQuery);
}).call(this);
