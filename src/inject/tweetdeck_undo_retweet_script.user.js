// ==UserScript==
// @name         tweetdeck undo tweet script
// @namespace    http://tampermonkey.net/
// @version      0.2
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
var tweets = 0,scrollTimer,undoRetweetTimer;

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

    undoRetweetTimer = 6;
    undoRetweetTimer *= 1000;

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
        setTimeout(function(id){
            console.log('current selected username: '+currentUserName);
            if($('.js-account-settings-scroll-container .js-account-settings-accounts .js-accordion-item:eq('+id+') .username').length){
                currentUserName = $('.js-account-settings-scroll-container .js-account-settings-accounts .js-accordion-item:eq('+id+') .username')[0].innerHTML.trim().replace('@','');
                currentUserName = currentUserName.toLowerCase();
                console.log('calling clickDefaultAccountButton');
                clickDefaultAccountButton();
            }
        }(id),1000);
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
                currentAccount++;
                user = 0;
                console.log('no refresh, switching to next default account');
                onFirstLoadInit();
                //window.location.reload();
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
        },(generalWait+3000));
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
    var scrollHeight = 10000;
    var d = jQuery('.js-column-content .js-column-scroller.js-dropdown-container.scroll-alt');
        d = d[0];
    getTweets();
    function getTweets(){
        if($('.js-modal-panel .js-column-holder .js-column-content .js-chirp-container').length && $('.js-modal-panel .js-column-holder .js-column-content .js-chirp-container article').length){
            tweets = $(d).find('article.stream-item').length;
            $(d).scrollTop(scrollHeight);
            setTimeout(function(){
                if(tweets != $(d).find('article.stream-item').length){
                    getTweets();
                    scrollHeight+=10000;
                }else{
                    loadRetweets();
                }
            },scrollTimer);
        }else{
            setTimeout(function(){
                loadTweets();
            },generalWait);
        }
    }
}

function loadRetweets(){
    var retweets = $('#open-modal article .is-retweet .position-rel a.tweet-action');
    if(!retweets.length){
        console.log('no retweets found hence switching default account');
        currentAccount++;
        user = 0;
        onFirstLoadInit();
        return;
    }
    var retweetCounter = 0;
    console.log('total retweets length:'+retweets.length);
    var timer = setInterval(function(){
        if(retweetCounter>(retweets.length-1)){
        	clearInterval(timer);
        	if(isCycleOver){
        		console.log('Full cycle over, hence Undo Retweet done!!!');
        		return;
        	}
        	console.log('switching default account');
            currentAccount++;
            user = 0;
            onFirstLoadInit();
            return;
        }
        console.log('clicking retweet no:'+retweetCounter);
        clickMenu(retweets[retweetCounter]);
        retweetCounter++;
    },undoRetweetTimer);   
}

function clickMenu(element){
    if(!element)
        return;
    setTimeout(function(element){
        element.click();
        setTimeout(function(element){
            element = $(element).next();
            element = $(element).find('a[data-action=undo-retweet]')[0];
            setTimeout(function(element){
                $(element).parent().addClass('is-selected');
                console.log('clicked undo retweet');
                element.click();
            }(element),1000);
        }(element),1000);
    }(element),1000);
}
// Your code here...
