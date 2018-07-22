/**
 * Flash Plugin
 * @category  Flash Plugin to show success
 * NB : We can extend this plugin to perform more functionality
 * @author Anurup Borah<anurupborah2001@gmail.com>
 * @version 1.0
 */
(function($){ 
    //Flash = {};
    $.fn.Flash = function(options){
        var thisObj= this;
        var settings = $.extend(true,{},{
            // These are the defaults.
            action : 'success'
        }, options );
        return {
          success : function(msg,time){
           time = time || 1000;
           var templateMsg = "<div class=\"success message\">" + msg + "</div>";
                if($(thisObj)[0].innerHTML == ""){
                    $(thisObj)[0].innerHTML = templateMsg;
                }else{
                    $(thisObj)[0].innerHTML += templateMsg;
                }
                $(thisObj).addClass('showing');
                setTimeout(function(){
                  $(thisObj).removeClass('showing');
                }, time);  
        },
      };
    }
})(jQuery)