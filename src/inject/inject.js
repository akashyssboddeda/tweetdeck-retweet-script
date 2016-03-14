
chrome.runtime.sendMessage({"message": "activate_icon"});

var $,user,usernames,blacklistedUsername,waitTime,currentUserName,generalWait;
var isCycleOver;
var currentAccount,scrollTimer;
var isStarted,isPaused,isStopped = true;

generalWait = 1.5; //input in seconds -> bot speed
generalWait = generalWait * 1000;

chrome.runtime.onMessage.addListener(
    function(request, sender, sendResponse) {
    if (request.message === "start") {
        chrome.runtime.sendMessage({log: "Start button Pressed"});
        isStopped = false;
    }else if(request.message==='stop'){
        chrome.runtime.sendMessage({log: "Stop button Pressed"});
        isStopped = true;
    }
});

function start(){
    chrome.storage.local.get("tweetdeck_options", function(obj) {
        // if(obj && obj.tweetdeck_options){
        //     var tweetdeck_options = JSON.parse(obj.tweetdeck_options);
        //     isStopped = !tweetdeck_options.autoStart;
        // }
        var tweetdeck_options = JSON.parse(obj.tweetdeck_options);
        var timer = setInterval(function(){
            console.log(isStopped);
            if (obj && obj.tweetdeck_options && !isStopped) {
                console.log('started');
                chrome.runtime.sendMessage({log: "Getting Values from Extension"});

                usernames = tweetdeck_options.usernames;
                blacklistedUsername = tweetdeck_options.blacklistedUsernames;
                waitTime = tweetdeck_options.cycleWaitTime;

                user = 0;
                currentAccount = 1;
                isCycleOver = false;
                currentUserName = '';

                scrollTimer = 5;
                scrollTimer = scrollTimer * 1000;

                chrome.runtime.sendMessage({log: "usernames: "+usernames.toString()});
                chrome.runtime.sendMessage({log: "blacklistedUsernames: "+blacklistedUsername.toString()});
                chrome.runtime.sendMessage({log: "waitTime: "+waitTime+" minutes"});
                chrome.runtime.sendMessage({log: "currentAccount: "+currentAccount});

                waitTime = waitTime * 60; // converting to seconds
                waitTime = waitTime * 1000; //converting to milliseconds

                clearInterval(timer);
                onFirstLoadInit();
            }
        },generalWait);
    });
}

window.addEventListener('load', function () {
    $ = jQuery;
    chrome.runtime.sendMessage({log: "Extension running"});
    start();
}, false);

function onFirstLoadInit(){
    var timer = setInterval(function(){
        if($('.app-navigator').length && !isStopped){
            clearInterval(timer);
            startAccountClick();
        }
    },generalWait);
}

function startAccountClick(){
    var timer = setInterval(function(){
        if(!isStopped){
            clearInterval(timer);
            $('.app-navigator .js-show-drawer.js-header-action')[0].click();
            selectUserAccount();
        }
    },1000);
}

function selectUserAccount(){
    setTimeout(function(){
        var id = currentAccount;

        if(!$('.js-account-settings-scroll-container .js-account-settings-accounts .js-accordion-item:eq('+id+')').hasClass('is-active')){
            $('.js-account-settings-scroll-container .js-account-settings-accounts .js-accordion-item:eq('+id+') .obj-right')[0].click();
        }
        if(id==$('.js-account-settings-scroll-container .js-account-settings-accounts .js-accordion-item').length-1){
            isCycleOver = true;
        }
        var timer = setInterval(function(){
            if(!isStopped){
                clearInterval(timer);
                currentUserName = $('.js-account-settings-scroll-container .js-account-settings-accounts .js-accordion-item:eq('+id+') .username')[0].innerHTML.trim().replace('@','');
                currentUserName = currentUserName.toLowerCase();
                chrome.runtime.sendMessage({log: 'selecting default account: '+currentUserName});
                clickDefaultAccountButton();
            }
        },1000);
    },generalWait);
}

function clickDefaultAccountButton(){
    var timer = setInterval(function(){
        if(!isStopped){
            clearInterval(timer);

            var id = currentAccount;
            if($('.js-account-settings-scroll-container .js-account-settings-accounts .js-accordion-item:eq('+id+') button[data-action="setDefault"]').length){
                chrome.runtime.sendMessage({log: 'default account button clicked'});
                $('.js-account-settings-scroll-container .js-account-settings-accounts .js-accordion-item:eq('+id+') button[data-action="setDefault"]')[0].click();
            }
            setTimeout(function(){
                clickSearchBtn();
            },500);
        }
    },generalWait);
}

function clickSearchBtn(){
    var triggers = 0;
    var id = user;
    $('.js-app-header .app-search-fake')[0].click();
    chrome.runtime.sendMessage({log: 'search button clicked'});
    var interval = setInterval(function(){
        if(!isStopped){
            clearInterval(interval);
            chrome.runtime.sendMessage({log: 'entering search value: '+usernames[id]});
            $('.js-popover-content input.search-input').val(usernames[id]);
            setTimeout(function(){
                var el = $('.js-popover-content input.search-input')[0];
        		var event = new KeyboardEvent('keydown');
        		el.dispatchEvent(event);
                var timer = setInterval(function(){
                    if(triggers==5){
                		clearInterval(timer);
                		window.location.reload();
                		return;
                	}
                	triggers++;
                    if($('.js-popover-content ul.list-divider.has-results li').length){
                        chrome.runtime.sendMessage({log: 'Selecting user from search data: '+usernames[id]});
                        $('.js-popover-content ul.list-divider.has-results li')[0].click();
                        clearInterval(timer);
                        clickLikes();
                    }else{
                        $('.js-popover-content input.search-input').val(usernames[id]);
        				setTimeout(function(){
                            chrome.runtime.sendMessage({log: 'No twitter search results !! calling twitter search request again'});
        					var el = $('.js-popover-content input.search-input')[0];
        					var event = new KeyboardEvent('keydown');
        					el.dispatchEvent(event);
        				},100);
        			}
                },generalWait);
            },1000);
        }
    },3000);
}

function clickLikes(){
    var timer = setInterval(function(){
        if($('.js-modal-content .icon.icon-favorite').length && !isStopped){
            clearInterval(timer);
            chrome.runtime.sendMessage({log: 'Like Button clicked'});
            $('.js-modal-content .icon.icon-favorite')[0].click();
            setTimeout(function(){
                loadTweets();
            },generalWait);
            //clickRandomTweet();
        }else{
            if($('.js-popover-content ul.list-divider.has-results li').length){
                $('.js-popover-content ul.list-divider.has-results li')[0].click();
            }
        }
    },generalWait);
}

function loadTweets(){
    var scrollHeight = 1000000;
    var d = jQuery('.js-column-content .js-column-scroller.js-dropdown-container.scroll-alt');
        d = d[0];
    getTweets();
    function getTweets(){
        if($('.js-modal-panel .js-column-holder .js-column-content .js-chirp-container').length && $('.js-modal-panel .js-column-holder .js-column-content .js-chirp-container article').length){
            tweets = $(d).find('article.stream-item').length;
            $(d).scrollTop(100000);
            setTimeout(function(){
                if(tweets != $(d).find('article.stream-item').length){
                    getTweets();
                    scrollHeight+=1000000;
                }else{
                    clickRandomTweet();
                }
            },scrollTimer);
        }else{
            setTimeout(function(){
                loadTweets();
            },generalWait);
        }
    }

}

function clickRandomTweet(){
    var timer = setInterval(function(){
        if(!isStopped && $('.js-modal-panel .js-column-holder .js-column-content .js-chirp-container').length && $('.js-modal-panel .js-column-holder .js-column-content .js-chirp-container article').length){
            clearInterval(timer);
            var length = $('.js-modal-panel .js-column-holder .js-column-content .js-chirp-container article').length - 1;
            var random = Math.floor(Math.random()*length);
            chrome.runtime.sendMessage({log: 'selecting Random Tweet'});
            //chrome.runtime.sendMessage({log: 'selecting Random Tweet no: '+random});
            var tweet = $('.js-modal-panel .js-column-holder .js-column-content .js-chirp-container article:eq('+random+')');
            $(tweet).find('.icon-retweet')[0].click();
            selectUsersAndTweet();
        }
    },generalWait);
}

function selectUsersAndTweet(){
    var timer = setInterval(function(){
        if($('#actions-modal .js-account-selector li').length && !isStopped){
            clearInterval(timer);
            var users = $('#actions-modal .js-account-selector li');
            var userlimit = users.length;
            var selectedCount = userlimit;

            for(var i = 0;i < userlimit; i++){
                var v = users[i];
                var username = $(v).attr('title') || $(v).attr('data-original-title');
                username = username.toLowerCase();
                if(username == currentUserName){
                    if(blacklistedUsername.indexOf(username)>=0){
                        --selectedCount;
                        $(v)[0].click();
                    }
                }else{
                    if(blacklistedUsername.indexOf(username)<0){
                        $(v)[0].click();
                    }else{
                        --selectedCount;
                    }
                }
            }

            chrome.runtime.sendMessage({log: selectedCount+' accounts selected for Retweet'});

            setTimeout(function(){
                $('#actions-modal .js-retweet-button')[0].click();
                chrome.runtime.sendMessage({log: 'Retweet button clicked and waiting for '+Math.floor(waitTime/(1000*60))+' minutes')});
                user++;
                var timer = setInterval(function(){
                    if(isStopped){
                        return;
                    }
                    clearInterval(timer);
                    if(usernames.length != user){
                        chrome.runtime.sendMessage({log: 'Searching another user and waited for '+generalWait+' ms'});
                        setTimeout(function(){
                            onFirstLoadInit();
                        },generalWait);
                    }else{
                        if(isCycleOver){
                            setTimeout(function(){
                                chrome.runtime.sendMessage({log: 'cycle over starting again and waited for '+(waitTime/60000)+' minutes'});
                                start();
                            },waitTime);
                        }else{
                            setTimeout(function(){
                                currentAccount++;
                                chrome.runtime.sendMessage({log: 'Repeating process for another user: '+currentAccount+' and waited for '+((waitTime/60000))+' minutes'});
                                user = 0;
                                onFirstLoadInit();
                            },waitTime);
                        }
                    }
                },1000);
            },generalWait);
        }
    },generalWait);
}
// Your code here...
