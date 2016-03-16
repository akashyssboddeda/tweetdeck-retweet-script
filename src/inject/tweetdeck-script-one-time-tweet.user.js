// ==UserScript==
// @name         tweetdeck script
// @namespace    http://tampermonkey.net/
// @version      0.1
// @description  Userscript to autotweet on tweetdeck
// @author       Gopinath Shiva
// @match        https://tweetdeck.twitter.com/
// @run-at       document-end
// @grant        none

// ==/UserScript==
/* jshint -W097 */
'use strict';

var $,user,usernames,blacklistedUsername,waitTime,currentUserName,generalWait;
var isCycleOver;
var currentAccount;
var tweets = 0,scrollTimer;

function start(){
    tweets = 0;
    console.log('initializing values');
    user = 0;
    currentAccount = 1;
    isCycleOver = false;
    usernames = ['justsomeguy1112'];
    blacklistedUsername = ['iowkeydeck'];
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
    console.log('inside clicking Search Button');
    var id = user;
    $('.js-app-header .app-search-fake').click();
    setTimeout(function(){
        console.log('entering search value: '+usernames[id]);
        $('.js-popover-content input.search-input').val(usernames[id]);
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
            }
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
        console.log($('.js-modal-panel .js-column-holder .js-column-content .js-chirp-container').length);
        if($('.js-modal-panel .js-column-holder .js-column-content .js-chirp-container').length && $('.js-modal-panel .js-column-holder .js-column-content .js-chirp-container article').length){
            clearInterval(timer);
            var length = $('.js-modal-panel .js-column-holder .js-column-content .js-chirp-container article').length;
            var random = Math.floor(Math.random()*length)-1;
            console.log('selecting Random Tweet: '+random);
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
            var userlimit = users.length;

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

            setTimeout(function(){
                console.log('Clicking Retweet Button');
                $('#actions-modal .js-retweet-button').click();
                user++;
                if(usernames.length != user){
                    setTimeout(function(){
                        onFirstLoadInit();
                    },generalWait);
                }else{
                    if(isCycleOver){
                        console.log('cycle over starting again');
                        setTimeout(function(){
                            start();
                        },waitTime);
                    }else{
                        console.log('Repeating process for another user: #'+currentAccount+' waiting for '+(waitTime/60000)+' minutes');
                        setTimeout(function(){
                            currentAccount++;
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
