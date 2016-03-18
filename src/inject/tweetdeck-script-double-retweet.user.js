// ==UserScript==
// @name         tweetdeck double RT script
// @namespace    http://tampermonkey.net/
// @version      0.6
// @description  Userscript to autotweet on tweetdeck
// @author       Gopinath Shiva
// @match        https://tweetdeck.twitter.com/
// @run-at       document-end
// @grant        none
// ==/UserScript==
/* jshint -W097 */
'use strict';
var $,user,usernames,blacklistedUsername,waitTime,currentUserName,generalWait,muteUsernames;
var firstTweetId = -1;
var tweetCount = 2;
var isCycleOver;
var currentAccount,scrollTimer;
var tweets = 0;
function start(){
    console.log('initializing values');
    user = 0;
    currentAccount = 1;
    isCycleOver = false;
    firstTweetId = -1;
    tweetCount = 2;
    usernames = ['bilaleren17','justsomeguy1112'];
    blacklistedUsername = ['vividdeck'];
    muteUsernames = [];
    waitTime = 1;
    currentUserName = '';
    scrollTimer = 5;
    scrollTimer = scrollTimer * 1000;
    generalWait = 1.5; //input in seconds -> bot speed
    generalWait = generalWait * 1000;
    waitTime = waitTime * 60; // converting to seconds
    waitTime = waitTime * 1000; //converting to milliseconds
    onFirstLoadInit();
}
window.addEventListener('load', function () {
    $ = jQuery;
    console.log('starting bot');
    start();
}, false);
function onFirstLoadInit(){
    var timer = setInterval(function(){
        if($('.app-navigator').length){
            clearInterval(timer);
            if(muteUsernames.length){
            	checkMute();
            }else{
            	startAccountClick();
            }
        }
    },generalWait);
}
function checkMute(){
    $('.js-app-settings .icon-settings').click();
    var timer = setInterval(function(){
        if($('.js-dropdown.dropdown-menu li:eq(3) a').length){
            clearInterval(timer);
            $('.js-dropdown.dropdown-menu li:eq(3) a').click();
            clickMuteSettings();
        }
    },generalWait);
}

function clickMuteSettings(){
    var timer = setInterval(function(){
        if($('#settings-modal .js-setting-list li').length && $('#settings-modal .js-setting-list li:eq(2) a').length){
            clearInterval(timer);
            $('#settings-modal .js-setting-list li:eq(2) a').click();
            removeMuteUsers();
        }
    },generalWait);
}

function removeMuteUsers(){
    var timer = setInterval(function(){
        if($('#global_filter_settings #filter-results li').length && muteUsernames.length){
        	clearInterval(timer);
            var limit = $('#global_filter_settings #filter-results li').length;
            $('#global_filter_settings #filter-results li').each(function(k,v){
                var text = $(v).text().replace('Muting user','');
                text = text.trim();
                text = text.slice(1,text.length-1);
                setTimeout(function(v,text,k){
                    if(muteUsernames.indexOf(text)>=0){
                        $(v).find('input').click();
                    }
                    if(k == limit-1){
                        setTimeout(function(){
                            startAccountClick();
                        },generalWait);
                    }
                }(v,text,k),generalWait);
            });
        }else{
        	clearInterval(timer);
        	startAccountClick();
        }
    },generalWait);
}

function startAccountClick(){
    console.log('clicking account menu');
    $('.app-navigator .js-show-drawer.js-header-action').click();
    selectUserAccount();
}
function selectUserAccount(){
    setTimeout(function(){
        console.log('choosing default account: '+currentAccount);
        var id = currentAccount;
        if(!$('.js-account-settings-scroll-container .js-account-settings-accounts .js-accordion-item:eq('+id+')').hasClass('is-active')){
            $('.js-account-settings-scroll-container .js-account-settings-accounts .js-accordion-item:eq('+id+') .obj-right').click();
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
            $('.js-account-settings-scroll-container .js-account-settings-accounts .js-accordion-item:eq('+id+') button[data-action="setDefault"]').click();
        }
        setTimeout(function(){
            clickSearchBtn();
        },500);
    },generalWait);
}
function clickSearchBtn(){
	var triggers = 0;
    console.log('opening Search sidebar');
    var id = user;
    $('.js-app-header .app-search-fake').click();
    setTimeout(function(){
        console.log('entering search value: '+usernames[id]);
        $('.js-popover-content input.search-input').val(usernames[id]);
        setTimeout(function(){
            $('.js-popover-content input.search-input').keypress();
            var timer = setInterval(function(){
            	if(triggers==5){
            		clearInterval(timer);
            		window.location.reload();
            		return;
            	}
            	triggers++;
                if($('.js-popover-content ul.list-divider.has-results li').length){
                    $('.js-popover-content ul.list-divider.has-results li')[0].click();
                    clearInterval(timer);
                    clickLikes();
                }else{
                    console.log('searching again');
                    $('.js-popover-content input.search-input').val('');
                    setTimeout(function(){
                        $('.js-popover-content input.search-input').val(usernames[id]);
                    },100);
                    setTimeout(function(){
                        console.log('triggering keydown again');
                        var el = $('.js-popover-content input.search-input')[0];
                        var event = new KeyboardEvent('keydown');
                        el.dispatchEvent(event);
                    },1000);
                }
            },(generalWait+7000));
        },generalWait);
    },3000);
}
function clickLikes(){
    console.log('clicking Like button');
    var timer = setInterval(function(){
        if($('.js-modal-content .icon.icon-favorite').length){
            clearInterval(timer);
            $('.js-modal-content .icon.icon-favorite').click();
            setTimeout(function(){
                loadTweets();
            },generalWait);
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
        if($('.js-modal-panel .js-column-holder .js-column-content .js-chirp-container').length && $('.js-modal-panel .js-column-holder .js-column-content .js-chirp-container article').length){
            clearInterval(timer);
            var length = $('.js-modal-panel .js-column-holder .js-column-content .js-chirp-container article').length;
            var random = Math.floor(Math.random()*length)-1;
            while(firstTweetId==random){
                random = Math.floor(Math.random()*length)-1;
            }
            console.log('selecting Random Tweet: '+random);
            firstTweetId = random;
            var tweet = $('.js-modal-panel .js-column-holder .js-column-content .js-chirp-container article:eq('+random+')');
            $(tweet).find('.icon-retweet').click();
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
            var userlimit = Math.floor(users.length/2);
            if(tweetCount==2){
                console.log('selecting users for first tweet');
                for(var i = 0;i < userlimit; i++){
                    var v = users[i];
                    var username = $(v).attr('title') || $(v).attr('data-original-title');
                    username = username.toLowerCase();
                    if(username == currentUserName){
                        if(blacklistedUsername.indexOf(username)>=0){
                            $(v).click();
                        }
                    }else{
                        if(blacklistedUsername.indexOf(username)<0){
                            $(v).click();
                        }
                    }
                }
            }else{
                console.log('selecting users for second tweet');
                for(var i = 0;i<userlimit;i++){
                    var v = users[i];
                    var username = $(v).attr('title') || $(v).attr('data-original-title');
                    username = username.toLowerCase();
                    if(username == currentUserName){
                        //if(blacklistedUsername.indexOf(username)>=0){
                            $(v).click();
                        //}
                        break;
                    }
                }
                for(var i = users.length-1;i >= userlimit; i--){
                    var v = users[i];
                    var username = $(v).attr('title') || $(v).attr('data-original-title');
                    username = username.toLowerCase();
                    if(blacklistedUsername.indexOf(username)<0){
                        $(v).click();
                    }
                }
            }
            setTimeout(function(){
                console.log('Clicking Retweet Button');
                $('#actions-modal .js-retweet-button').click();
                tweetCount--;
                if(!tweetCount){
                    tweetCount = 2;
                    user++;
                    if(usernames.length != user){
                    	console.log('changing username and waiting for '+generalWait+' minutes');
                        setTimeout(function(){
                            clickSearchBtn();
                        },generalWait);
                    }else{
                        if(isCycleOver){
                        	console.log('cycle over starting again in '+waitTime/60000+' minutes');
                            setTimeout(function(){
                            	console.log('closing search sidebar');
                            	$('.js-app-header .app-search-fake').click();
                                start();
                            },waitTime);
                        }else{
                        	console.log('Repeating process for another user: '+currentAccount+ 'and waiting for '+waitTime/60000+' minutes');
                            setTimeout(function(){
                            	console.log('closing search sidebar');
                            	$('.js-app-header .app-search-fake').click();
                                currentAccount++;
                                user = 0;
                                onFirstLoadInit();
                            },waitTime);
                        }
                    }
                }else{
                    setTimeout(function(){
                        clickSearchBtn();
                    },generalWait);
                }
            },generalWait);
        }
    },generalWait);
}
// Your code here...
