/**
 * 모달
 * version 0.0.0
 * kcp
 */
(function(e) {
(function($) {
	/* strict 모드 */
	"use strict";
	
	// 클래스
	var Modal = function(element, options){

		// member variables
		// 현재 모달이 켜져 있는지 여부
		this.isOpened = false;
		// 커튼 DOM
		this.curtain = $("<div />", {
			"class" : "curtain",
			css: {
				"position":			"fixed",
				"left":				"0",
				"top":				"0",
				"width":			"100%",
				"height":			"100%",
				"z-index":			"1000",
				"background-color":	"rgba(0,0,0,.4)",
				"text-align":		"center"
			}
		})
		
		// caller
		this.$element = element;
		this.options = options;
		
		// event binding
		this.bindEvents();
		
		// initialize
		this.init();
	}
	
	// 클래스 멤버 함수 정의
	Modal.prototype = {
		
		/**
		 * 초기화
		 */
		init: function(){
			// 타겟 CSS
			$(this.options.target).css({
				"margin":	"0 auto",
				"position":	"relative",
				"top":		"50%",
				"transform":"translatey(-50%)",
				"display":	"inline-block",
			});
			// 타겟 숨김
			$(this.options.target).hide();
		},
		
		/**
		 * 이벤트 부여
		 */
		bindEvents: function(){
			var thisRef = this;
			
			// 호출한 버튼에 이벤트 부여
			this.$element.on("click", function(){
				thisRef.showModal();
			});
			// 커튼에 이벤트 부여
			this.curtain.on("click", function(){
				thisRef.hideModal();
			});
			// 타겟에 이벤트 부여
			$(this.options.target).on("click", function(e){
				// 버블링을 막아서 커튼의 클릭 이벤트 호출을 막음
				e.stopPropagation();
			});
			// 취소 버튼
			$(this.options.btnCancel).on("click", function(){
				thisRef.hideModal();
			});
			// 확인 버튼
			$(this.options.btnOk).on("click", function(){
				if(thisRef.options.onOkClicked)
					thisRef.options.onOkClicked.call(this);
				thisRef.hideModal();
			});
		},
		
		/**
		*	모달 출력
		*/
		showModal: function(){
			if(this.options.onPreOpenModal)
				this.options.onPreOpenModal.call(this);
			$(this.options.target).wrap(this.curtain);
			$(this.options.target).show();
			$("body").css("overflow", "hidden");
			if(this.options.onPostOpenModal)
				this.options.onPostOpenModal.call(this);
			this.isOpened = true;
		},
		
		/**
		*	모달 감춤
		*/
		hideModal: function(){
			$(this.options.target).unwrap(this.curtain);
			$(this.options.target).hide();
			$("body").css("overflow", "");
			this.isOpened = false;
		},
	}
	
	// 플러그인
	$.fn.modal = function(options){
		var defaults = {
			target:		"",
			btnCancel:	"",
			btnOk:		"",
			onOkClicked:void 0,
			onPreOpenModal:void 0,
			onPostOpenModal:void 0,
		}
		var settings = $.extend({}, defaults, options);
		
        return this.each(function(){
            var $el = $(this);
            if ($el.data("modal"))
                $el.data("modal").remove();
            $el.data("modal", new Modal($el, settings));
		});
	}
})(jQuery);
}).call(this);