(function(e) {
(function($) {
	/* strict 모드 */
	"use strict";
	
	// 클래스
	var Loading = function(element, options){
	
		// members
		this.curtain = $("<div />", {
			"class": "curtain",
			css: {
				"position":			"absolute",
				"top":				"0",
				"background-color":	"rgba(0,0,0,.4)",
				"z-index":			"1000",
			}
		});
		this.dot = $("<span />", {
			css: {
				"width":			"25%",
				"height":			"25%",
				"background-color":	"rgb(0,0,0)",
				"border-radius":	"2px",
				"position":			"absolute",
				"animation":		""
			}
		});
		
		// caller
		this.$element = element;
		this.options = options;
		
		// initialize
		this.init();
	}
	
	// 클래스 멤버 함수 정의
	Loading.prototype = {
		
		/**
		 * 초기화
		 */
		init: function(){
		},
		
		/**
		*	로딩 출력
		*/
		show: function(){
			if(this.options.onPreShow)
				this.options.onPreShow.call(this);
			this.curtain.width(this.$element.width());
			this.curtain.height(this.$element.height());
			this.$element.append(this.curtain);
		},
		
		/**
		*	로딩 감춤
		*/
		hide: function(){
			this.curtain.remove();
		},
	}
	
	// 플러그인
	$.fn.loading = function(options){
		
        return this.each(function(){
            var $el = $(this);
			if(typeof options != "boolean"){
				if ($el.data("loading"))
					$el.data("loading").remove();
				var defaults = {
					onPreShow:void 0,
				}
				var settings = $.extend({}, defaults, options);
				$el.data("loading", new Loading($el, settings));
			}else if($el.data("loading")){
				if(options)
					$el.data("loading").show();
				else
					$el.data("loading").hide();
			}
		});
	}
})(jQuery);
}).call(this);