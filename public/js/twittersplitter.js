/**
 * Twitter Splitter
 * @category  Twitter Splitter Algorithm
 * @author Anurup Borah<anurupborah2001@gmail.com>
 * @version 1.0
 */
(function(){
    
    if(!Array.prototype.indexOf){
        Array.prototype.indexOf = function(val){
            var i = this.length;
            while (i--) {
                if (this[i] == val) return i;
            }
            return -1;
        } 
    }
  
  var twitterSplitter = {
    messageToSend: '',
    msgSplitter : " : ",
    maxLength: 50, 
    trimmedString: '',
    user1LocalStorageKey: 'user1',
    user2LocalStorageKey: 'user2',
    chatTimeStartLocalStorageKey: 'chatTimeStart',
    users : [],
    usersImg : [
        'images/avatar1.jpg',
        'images/avatar2.jpg'
    ],
    direction : [
        "left",
        "right"
    ],
    socket: io(),
    init: function() {
      this.cacheDOM();
      this.entryCheck();
      this.setUserData();
      this.getNoticeSocketMessage();
      this.getHistoryMessages();
      this.bindEvents();
    },
    cacheDOM: function() {
        this.$user1 = $('#user1');
        this.$user2 = $('#user2');
        this.$chatEnterButton = $('#chatEnterBtn');
        
      
        this.$button = $('.chatBtn');
        this.$textarea = $('.msgArea');
        this.$minutes = $('.text-muted')
        this.$chatArea = $('.chat');
        this.$chatAreaLiLast = $('ul.chat li');
        this.$rightBox = $('.right-box');
        this.labelChat1 = $('.label-chat1');
        this.labelChat2 = $('.label-chat2');
        this.$logoutBtnModal = $('.logout');
        this.$flashElem = $("#flashMSG");
        this.$logoutModal = $("#logOut");
        this.$logoutBrn = $(".logoutBtn");
   //   this.$chatHistoryList =  this.$chatHistory.find('ul');
    },
    entryCheck : function(){
        if (localStorage.getItem(this.user1LocalStorageKey) === null || localStorage.getItem(this.user2LocalStorageKey) === null) {
           if(window.location.pathname=="/chat"){
                window.location = "/";
           }
        }
    },
    setUserData : function(){
        if(this.labelChat1.length > 0 && this.labelChat2.length > 0){
            this.users = this.getUserInfo();
            this.labelChat1.text(this.users[0]);
            this.labelChat2.text(this.users[1]);
            this.emitSocketMessage("join",$.trim(this.users[0]));
            this.emitSocketMessage("join",$.trim(this.users[1]));
        }
    },
    bindEvents: function() {
      this.$button.on('click', this.addMessage.bind(this));
      this.$textarea.on('keyup', this.addMessageEnter.bind(this));
      this.$chatEnterButton.on('click', this.enterChatRoom.bind(this));
      this.$logoutBtnModal.on('click', this.leaveChatRoom.bind(this));
      this.$logoutBrn.on('click', this.showModal.bind(this));
    },
    render : function(num,block,time){
        var name = !(block) ? "me" : this.users[num];
        var directionBlock = !(block) ? this.direction[1] : this.direction[0];
        var template = '<li class="' + directionBlock + ' clearfix"><span class="chat-img pull-' + directionBlock + '"><img src="' + this.usersImg[num] + '" alt="' + name + '" class="img-circle" />';
            template += '</span><div class="chat-body clearfix"><div class="header"><small class="text-muted"><span class="glyphicon glyphicon-time"></span>' + time + '</small>';
            template += '<strong class="pull-' + directionBlock + ' primary-font">' + name + '</strong></div>';
            template += '{{#items}}<p>{{.}}</p>{{/items}}';
            template += '</div></li>';
        return template;
    },
    splitter : function(message) {
        var strModified = [];
        if(message.trim() !== ""){
            var splitSTr = message.split(" ");
            var sentenceDivide = Math.round(message.length/50);
            var countCharacter = 0;
            var pageCount = 1;
            var appendSTr = "";
            splitSTr.forEach(function(i, idx, element) {
                countCharacter+= i.length + 1;
                if(countCharacter >= 49){
                    countCharacter = 0;
                    var modStr = pageCount  + "/" + sentenceDivide + " " + appendSTr.trim();
                    strModified.push(modStr);
                    pageCount+=1;
                    appendSTr = "";
                }
                
                appendSTr += i + " ";
                
                if(idx === element.length - 1){
                   var modStr = (pageCount > 1) ? pageCount  + "/" + sentenceDivide + " " + appendSTr.trim()  : appendSTr.trim();
                   strModified.push(modStr);  
                }
                
            });
        }
        return strModified;
    },
    emitSocketMessage: function(key,message) {
        this.socket.emit(key,message);
    },
    getSocketMessage : function(key){
       this.socket.on(key, function(msg){
           //console.log("hi" + msg);
        });
    },
    getHistoryMessages : function(){
        var $this = this;
       $.ajax({
            type: 'GET',
            url: '/get-message',
            success: function(result) {
               if(typeof result.messages != 'undefined'){
                    var msgArray = result.messages.reverse();
                    msgArray.forEach(function(msg){
                        var getData = msg.split($this.msgSplitter);
                        if(getData[0].indexOf($this.users[0]) >= 0){
                            $this.generateTemplate(getData[1],1,0,getData[2]);
                        }
                        if(getData[0].indexOf($this.users[1]) >= 0){
                             $this.generateTemplate(getData[1],2,1,getData[2]);
                        }
                    });
                }
            }
         });  
    },
    getNoticeSocketMessage : function(){
        this.socket.on('notice', function(msg) {
            $("#flashMSG").Flash({
                action : 'succes'
            }).success(msg)
        });
    },
    addMessage: function(event) {
        var getBtnid = 0; 
        if(typeof event != 'undefined'){
            getBtnid = event.target.id.replace ( /[^\d.]/g, '' );
            var userNo = getBtnid-1;
            this.messageToSend = this.$textarea.get(getBtnid-1).value;
            var splitMessage = this.splitter(this.messageToSend.trim()); 
            var currentUser = this.users[userNo];
            for(var i=0;i < splitMessage.length;i++){
                var msgObj = currentUser + this.msgSplitter + splitMessage[i] + this.msgSplitter +  new Date().toString().substr(0, 24);
                this.emitSocketMessage("message",msgObj);
                this.generateTemplate(splitMessage[i],getBtnid,userNo,new Date().toString().substr(0, 24));
            }
            this.getSocketMessage("message");
        }
    },
    generateTemplate : function(message,getBtnid,userNo,time){
        var viewData = {
                items: message
        };
        var leftBlock = (getBtnid==1) ? 1 : 0;
        var rightBlock = (getBtnid==2) ? 1 : 0;

        var tplLeft = this.render(userNo,leftBlock,time);
        var tplRight = this.render(userNo,rightBlock,time);
        var htmlLeft = Mustache.to_html(tplLeft,viewData);
        var htmlRight = Mustache.to_html(tplRight,viewData);
        if(this.$chatArea.find("li").length==0){
            this.$chatArea.get(0).innerHTML = htmlRight;
            this.$chatArea.get(1).innerHTML = htmlLeft;
        }else{
            $(htmlRight).insertAfter(this.$chatArea.get(0).lastChild)
            $(htmlLeft).insertAfter(this.$chatArea.get(1).lastChild)
        }
        this.$textarea.get(getBtnid-1).value ="";  
    },
    addMessageEnter: function(event) {
        // enter was pressed
        if (event.keyCode === 13) {
          this.addMessage();
        }
    },
    scrollToBottom: function() {
       this.$chatHistory.scrollTop(this.$chatHistory[0].scrollHeight);
    },
    getCurrentTime: function() {
      return new Date().toLocaleTimeString().
              replace(/([\d]+:[\d]{2})(:[\d]{2})(.*)/, "$1$3");
    },
    getCurrentDateTime: function() {
        var now     = new Date(); 
        var year    = now.getFullYear();
        var month   = now.getMonth()+1; 
        var day     = now.getDate();
        var hour    = now.getHours();
        var minute  = now.getMinutes();
        var second  = now.getSeconds(); 
        if(month.toString().length == 1) {
             month = '0'+month;
        }
        if(day.toString().length == 1) {
             day = '0'+day;
        }   
        if(hour.toString().length == 1) {
             hour = '0'+hour;
        }
        if(minute.toString().length == 1) {
             minute = '0'+minute;
        }
        if(second.toString().length == 1) {
             second = '0'+second;
        }   
        var dateTime = year+'/'+month+'/'+day+' '+hour+':'+minute+':'+second;   
         return dateTime;
    },
    getRandomItem: function(arr) {
      return arr[Math.floor(Math.random()*arr.length)];
    },
    getUserInfo : function(){
        return [localStorage.getItem(this.user1LocalStorageKey),localStorage.getItem(this.user2LocalStorageKey)]
    },
    enterChatRoom : function(event){
        if($.trim(this.$user1.val())==""){
            alert("Please enter User 1 name.");
        }else if($.trim(this.$user2.val())==""){
            alert("Please enter User 2 name.");
        }else{
            localStorage.setItem(this.user1LocalStorageKey, $.trim(this.$user1.val()));
            localStorage.setItem(this.user2LocalStorageKey, $.trim(this.$user2.val()));
            localStorage.setItem(this.chatTimeStartLocalStorageKey, this.getCurrentTime());
            window.location = "/chat";
        }
        return false;
    },
    showModal: function(event){
        this.$logoutModal.modal('show');
        this.$logoutModal.removeClass("fade");
    },
    leaveChatRoom : function(event){
        localStorage.removeItem(this.user1LocalStorageKey);
        localStorage.removeItem(this.user2LocalStorageKey);
        localStorage.removeItem(this.chatTimeStartLocalStorageKey);
        this.emitSocketMessage('disconnectuser','');
        window.location = "/";
        return false;
    }
    
};
 
twitterSplitter.init();

//Unite Testing
//var getSplittedMessage = twitterSplitter.splitter("I can't believe Tweeter now supports chunking my messages, so I don't have to do it myself");
//console.log(getSplittedMessage)
})();


