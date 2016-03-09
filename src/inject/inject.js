
chrome.runtime.sendMessage({"message": "activate_icon"});

var $,user,usernames,blacklistedUsername,waitTime,currentUserName,generalWait;
var isCycleOver;
var currentAccount;

var d = 0;
setInterval(function(){
    d++;
    chrome.runtime.sendMessage({log: "paragraph:"+d});
},1000);

function start(){
    chrome.storage.sync.get("tweetdeck_options", function(obj) {
        if (obj.tweetdeck_options) {
            console.log('initializing values');

            var tweetdeck_options = JSON.parse(obj.tweetdeck_options);
            usernames = tweetdeck_options.usernames;
            blacklistedUsername = tweetdeck_options.blacklistedUsernames;
            waitTime = tweetdeck_options.cycleWaitTime;

            user = 0;
            currentAccount = 1;
            isCycleOver = false;
            currentUserName = '';

            generalWait = 1.5; //input in seconds -> bot speed
            generalWait = generalWait * 1000;

            waitTime = waitTime * 60; // converting to seconds
            waitTime = waitTime * 1000; //converting to milliseconds
            onFirstLoadInit();
        }
    });
}

window.addEventListener('load', function () {
    $ = jQuery;
    start();
}, false);

function onFirstLoadInit(){
    var timer = setInterval(function(){
        if($('.app-navigator').length){
            clearInterval(timer);
            startAccountClick();
        }
    },generalWait);
}

function startAccountClick(){
    console.log('clicking account menu');
    $('.app-navigator .js-show-drawer.js-header-action')[0].click();
    selectUserAccount();
}

function selectUserAccount(){
    setTimeout(function(){
        console.log('choosing default account: '+currentAccount);
        var id = currentAccount;

        if(!$('.js-account-settings-scroll-container .js-account-settings-accounts .js-accordion-item:eq('+id+')').hasClass('is-active')){
            $('.js-account-settings-scroll-container .js-account-settings-accounts .js-accordion-item:eq('+id+') .obj-right')[0].click();
        }
        if(id==$('.js-account-settings-scroll-container .js-account-settings-accounts .js-accordion-item').length-1){
            isCycleOver = true;
        }
        setTimeout(function(){
            console.log('current selected username: '+currentUserName);
            currentUserName = $('.js-account-settings-scroll-container .js-account-settings-accounts .js-accordion-item:eq('+id+') .username')[0].innerHTML.trim().replace('@','');
            currentUserName = currentUserName.toLowerCase();
            console.log('calling clickDefaultAccountButton');
            clickDefaultAccountButton();
        },1000);
    },generalWait);
}

function clickDefaultAccountButton(){
    setTimeout(function(){
        console.log('clicking Default Account Button');

        var id = currentAccount;
        if($('.js-account-settings-scroll-container .js-account-settings-accounts .js-accordion-item:eq('+id+') button[data-action="setDefault"]').length){
            $('.js-account-settings-scroll-container .js-account-settings-accounts .js-accordion-item:eq('+id+') button[data-action="setDefault"]')[0].click();
        }
        setTimeout(function(){
            clickSearchBtn();
        },500);
    },generalWait);
}

function clickSearchBtn(){

    console.log('inside clicking Search Button');
    var id = user;
    $('.js-app-header .app-search-fake')[0].click();
    setTimeout(function(){
        console.log('entering search value: '+usernames[id]);
        $('.js-popover-content input.search-input').val(usernames[id]);
		var el = $('.js-popover-content input.search-input')[0];
		var event = new KeyboardEvent('keydown');
		el.dispatchEvent(event);
        var timer = setInterval(function(){
            if($('.js-popover-content ul.list-divider.has-results li').length){
                $('.js-popover-content ul.list-divider.has-results li')[0].click();
                clearInterval(timer);
                clickLikes();
            }else{
				setTimeout(function(){
					var el = $('.js-popover-content input.search-input')[0];
					var event = new KeyboardEvent('keydown');
					el.dispatchEvent(event);
				},100);
			}
        },generalWait);
    },3000);
}

function clickLikes(){
    console.log('clicking Like button');
    var timer = setInterval(function(){
        if($('.js-modal-content .icon.icon-favorite').length){
            clearInterval(timer);
            $('.js-modal-content .icon.icon-favorite')[0].click();
            clickRandomTweet();
        }else{
            if($('.js-popover-content ul.list-divider.has-results li').length){
                $('.js-popover-content ul.list-divider.has-results li')[0].click();
            }
        }
    },generalWait);
}

function clickRandomTweet(){
    var timer = setInterval(function(){
        console.log($('.js-modal-panel .js-column-holder .js-column-content .js-chirp-container').length);
        if($('.js-modal-panel .js-column-holder .js-column-content .js-chirp-container').length && $('.js-modal-panel .js-column-holder .js-column-content .js-chirp-container article').length){
            clearInterval(timer);
            var length = $('.js-modal-panel .js-column-holder .js-column-content .js-chirp-container article').length - 1;
            var random = Math.floor(Math.random()*length);
            console.log('selecting Random Tweet: '+random);
            var tweet = $('.js-modal-panel .js-column-holder .js-column-content .js-chirp-container article:eq('+random+')');
            $(tweet).find('.icon-retweet')[0].click();
            console.log('calling selectUsersAndTweet');
            selectUsersAndTweet();
        }
    },generalWait);
}

function selectUsersAndTweet(){
    console.log('inside selectUsersAndTweet');
    var timer = setInterval(function(){
        if($('#actions-modal .js-account-selector li').length){
            clearInterval(timer);
            var users = $('#actions-modal .js-account-selector li');
            var userlimit = users.length;

            for(var i = 0;i < userlimit; i++){
                var v = users[i];
                var username = $(v).attr('title') || $(v).attr('data-original-title');
                username = username.toLowerCase();
                if(username == currentUserName){
                    if(blacklistedUsername.indexOf(username)>=0){
                        $(v)[0].click();
                    }
                }else{
                    if(blacklistedUsername.indexOf(username)<0){
                        $(v)[0].click();
                    }
                }
            }

            setTimeout(function(){
                console.log('Clicking Retweet Button');
                $('#actions-modal .js-retweet-button')[0].click();
                user++;
                if(usernames.length != user){
                    setTimeout(function(){
                        onFirstLoadInit();
                    },generalWait);
                }else{
                    if(isCycleOver){
                        setTimeout(function(){
                            console.log('cycle over starting again');
                            start();
                        },waitTime);
                    }else{
                        setTimeout(function(){
                            currentAccount++;
                            console.log('Repeating process for another user: '+currentAccount);
                            user = 0;
                            onFirstLoadInit();
                        },waitTime);
                    }
                }
            },generalWait);
        }
    },generalWait);
}
// Your code here...
