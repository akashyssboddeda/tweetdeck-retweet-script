// ==UserScript==
// @name         tweetdeck Unblock script
// @namespace    http://tampermonkey.net/
// @version      1.0
// @description  Userscript to unblock users on tweetdeck
// @author       Gopinath Shiva
// @match        https://tweetdeck.twitter.com/
// @run-at       document-end
// @grant        none
// ==/UserScript==
/* jshint -W097 */
'use strict';
var $,waitTime,currentUserName,generalWait,muteUsernames;
var isCycleOver,currentMuteUsername;
var currentAccount;
function start(){

    currentMuteUsername = 0;
    currentAccount = 1;
    isCycleOver = false;
    muteUsernames = ['alimaadelat','bilaleren17','justsomeguy2223'];
    waitTime = 1;
    currentUserName = '';

    generalWait = 1.5; //input in seconds -> bot speed
    generalWait = generalWait * 1000;
    waitTime = waitTime * 60; // converting to seconds
    waitTime = waitTime * 1000; //converting to milliseconds

    addBlackListOverlay();

    console.log('initializing values');
    addTamperLog('initializing values');

    if(sessionStorage.getItem('lastUser')){
    	currentMuteUsername = sessionStorage.getItem('lastUser');
    	currentMuteUsername = parseInt(currentMuteUsername) + 1;
    	if(muteUsernames.length-1 < currentMuteUsername){
            console.log('when currentMuteUsername# is more than muteUsernames.length, reseting currentMuteUsername position to 0');
            addTamperLog('when currentMuteUsername# is more than muteUsernames.length, reseting currentMuteUsername position to 0');
    		currentMuteUsername = 0;
    	}
    	console.log('retrieving username location from browser and username position is: username#'+currentMuteUsername);
        addTamperLog('retrieving username location from browser and username position is: username#'+currentMuteUsername);
    	sessionStorage.removeItem('lastUser');
    }

    onFirstLoadInit();
}

function addBlackListOverlay () {
	if(!$('#tamper-overlay').length){
		var div = '<div id="tamper-overlay" style="position: absolute;top: 0;left: 0;width: 100%;z-index: 1000;background: #28AB28;color: white;text-align: center;padding: 5px;"><h1 style="font-size:40px;">'+muteUsernames[0]+'</h1></div>';
		$('body').append(div);
	}
    if(!$('#tamper-logs').length){
        var div = '<div id="tamper-logs" style="height:80px;overflow:auto;position: absolute;bottom: 0;left: 0;width: 100%;z-index: 1000;background: #fff;color: black;text-align: center;padding: 5px;"><h1 style="font-size:40px;">Logs are added here</h1><div id="tamper-log"></div></div>';
		$('body').append(div);
    }
    if(!$('#tamper-log-btn').length){
        $('body').append('<input style="z-index:2000;position:absolute;right:0;bottom:0;background:blue;color:white;" id="tamper-log-btn" type="button" value="copy logs">');
        setTimeout(function () {
            $('#tamper-log-btn').on('click',function () {
                var range = document.createRange();
                range.selectNode(document.getElementById("tamper-logs"));
                window.getSelection().addRange(range);
            });
        },10);
    }
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
            startAccountClick(); // bot has to check unmute and unblock after changing default account
        }
    },generalWait);
}

function checkUnblock(){
	console.log('begin checking unblock');
    addTamperLog('begin checking unblock');
	var muteUsername = muteUsernames[currentMuteUsername];
	setTimeout(function(){
		console.log('clicking search icon');
        addTamperLog('clicking search icon');
		$('.js-app-header .app-search-fake').click();
		setTimeout(function(){
			console.log('searching username: '+muteUsername);
            addTamperLog('searching username: '+muteUsername);
			$('.js-popover-content input.search-input').val(muteUsername);
        	setTimeout(function(){
        		var triggers = 0;
            	$('.js-popover-content input.search-input').keypress();
        		var timer = setInterval(function(){
	            	if(triggers==5){
	            		clearInterval(timer);
                        sessionStorage.setItem('lastUser',currentMuteUsername);
                        setTimeout(function () {
                            window.location.reload();
                        },100);
	            		return;
	            	}
	            	triggers++;
	                if($('.js-popover-content ul.list-divider.has-results li').length){
	                    $('.js-popover-content ul.list-divider.has-results li')[0].click();
	                    clearInterval(timer);
	                    setTimeout(function(){
	                    	if($('.js-modal-content .s-blocking div.block-text').length){
                                console.log('user is blocked so unblocking');
                                addTamperLog('user is blocked so unblocking');
	                    		$('.js-modal-content div.block-text').click();
	                    		setTimeout(function(){
	                    			$('.js-modal-content .sprite-close').click();
	                    			if(currentMuteUsername == muteUsernames.length -1){
                                        if(!isCycleOver){
                                            console.log('unblock finished proceeding account click');
                                            addTamperLog('unblock finished proceeding account click');
                                            currentMuteUsername = 0;
                                            currentAccount++;
                                            console.log('Resetting currentMuteUsername to zero');
                                            addTamperLog('Resetting currentMuteUsername to zero');
                                            $('.js-modals-container .sprite-close').click();
                                            startAccountClick();
                                        }else{
                                            console.log('Unblock Done. Bot stopped !!!');
                                            addTamperLog('Unblock Done. Bot stopped !!!');
                                            $('.js-modals-container .sprite-close').click();
                                        }
	                    			}else{
	                    				currentMuteUsername++;
	                    				console.log('proceeding unblock for next username');
                                        addTamperLog('proceeding unblock for next username');
                                        $('.js-modals-container .sprite-close').click();
	                    				checkUnblock();
	                    			}
	                    		},100);
	                    	}else{
                                console.log('user is not blocked so do nothing');
                                addTamperLog('user is not blocked so do nothing');
	                    		if(currentMuteUsername == muteUsernames.length -1){
                                    if(!isCycleOver){
                                        console.log('unblock finished proceeding username search to RT');
                                        addTamperLog('unblock finished proceeding username search to RT');
                                        currentMuteUsername = 0;
                                        currentAccount++;                        
                                        console.log('Resetting currentMuteUsername to zero');
                                        addTamperLog('Resetting currentMuteUsername to zero');
                                        $('.js-modals-container .sprite-close').click();
                                        startAccountClick();
                                    }else{
                                        console.log('Unblock Done. Bot stopped !!!');
                                        addTamperLog('Unblock Done. Bot stopped !!!');
                                        $('.js-modals-container .sprite-close').click();
                                    }
                    			}else{
                    				currentMuteUsername++;
                    				console.log('proceeding unblock for next username');
                                    addTamperLog('proceeding unblock for next username');
                                    $('.js-modals-container .sprite-close').click();
                    				checkUnblock();
                    			}
	                    	}
	                    },(generalWait*4));
	                }else{
	                    console.log('searching again');
                        addTamperLog('searching again');
	                    muteUsername = muteUsernames[currentMuteUsername];
	                    var lastChar = muteUsername.substr(muteUsername.length - 1);
	                    muteUsername = muteUsername.substr(0, muteUsername.length - 1);
	                    $('.js-popover-content input.search-input').val(muteUsername);
	                    setTimeout(function(){
	                    	muteUsername = muteUsername + lastChar;
	                    	$('.js-popover-content input.search-input').val(muteUsername);
		                    setTimeout(function(){
		                        console.log('triggering keydown again');
                                addTamperLog('triggering keydown again');
		                        var el = $('.js-popover-content input.search-input')[0];
		                        var event = new KeyboardEvent('keydown');
		                        el.dispatchEvent(event);
		                    },generalWait);
	                    },generalWait);
	                }
	            },(generalWait+3000));
        	},generalWait);
		},generalWait);
	},generalWait);
}

function startAccountClick(){
    console.log('clicking account menu');
    addTamperLog('clicking account menu');
    $('.app-navigator .js-show-drawer.js-header-action').click();
    selectUserAccount();
}
function selectUserAccount(){
    setTimeout(function(){
        console.log('choosing default account: '+currentAccount);
        addTamperLog('choosing default account: '+currentAccount);
        var id = currentAccount;
        if(!$('.js-account-settings-scroll-container .js-account-settings-accounts .js-accordion-item:eq('+id+')').hasClass('is-active')){
            $('.js-account-settings-scroll-container .js-account-settings-accounts .js-accordion-item:eq('+id+') .obj-right').click();
        }
        if(id==$('.js-account-settings-scroll-container .js-account-settings-accounts .js-accordion-item').length-1){
            isCycleOver = true;
        }
        setTimeout(function(){
            currentUserName = $('.js-account-settings-scroll-container .js-account-settings-accounts .js-accordion-item:eq('+id+') .username')[0].innerHTML.trim().replace('@','');
            currentUserName = currentUserName.toLowerCase();
            console.log('current selected username: '+currentUserName);
            addTamperLog('current selected username: '+currentUserName);
            console.log('calling clickDefaultAccountButton');
            addTamperLog('calling clickDefaultAccountButton');
            clickDefaultAccountButton();
        },1000);
    },generalWait);
}
function clickDefaultAccountButton(){
    setTimeout(function(){
        console.log('clicking Default Account Button');
        addTamperLog('clicking Default Account Button');
        var id = currentAccount;
        if($('.js-account-settings-scroll-container .js-account-settings-accounts .js-accordion-item:eq('+id+') button[data-action="setDefault"]').length){
            $('.js-account-settings-scroll-container .js-account-settings-accounts .js-accordion-item:eq('+id+') button[data-action="setDefault"]').click();
        }
        setTimeout(function(){
            if(muteUsernames.length){
            	checkUnblock();
            }
        },500);
    },generalWait);
}

function clickSearchBtn(){
    var triggers = 0;
    console.log('opening Search sidebar');
    addTamperLog('opening Search sidebar');
    var id = currentMuteUsername;
    $('.js-app-header .app-search-fake').click();
    setTimeout(function(){
        console.log('entering search value: '+muteUsernames[id]);
        addTamperLog('entering search value: '+muteUsernames[id]);
        $('.js-popover-content input.search-input').val(muteUsernames[id]);
        setTimeout(function(){
            $('.js-popover-content input.search-input').keypress();
            var timer = setInterval(function(){
                if(triggers==5){
                    clearInterval(timer);
                    sessionStorage.setItem('lastUser',currentMuteUsername);
                    setTimeout(function () {
                        window.location.reload();
                    },100);
                    return;
                }
                triggers++;
                if($('.js-popover-content ul.list-divider.has-results li').length){
                    $('.js-popover-content ul.list-divider.has-results li')[0].click();
                    clearInterval(timer);
                    checkUnblock();
                }else{
                    console.log('searching again');
                    addTamperLog('searching again');
                    $('.js-popover-content input.search-input').val('');
                    setTimeout(function(){
                        $('.js-popover-content input.search-input').val(usernames[id]);
                    },100);
                    setTimeout(function(){
                        console.log('triggering keydown again');
                        addTamperLog('triggering keydown again');
                        var el = $('.js-popover-content input.search-input')[0];
                        var event = new KeyboardEvent('keydown');
                        el.dispatchEvent(event);
                    },1000);
                }
            },(generalWait+5000));
        },generalWait);
    },3000);
}

// Your code here...

function addTamperLog(log){
    log = new Date() + ' '+ log;
    $('#tamper-log').append('<p>'+log+'</p>');
    var objDiv = document.getElementById("tamper-logs");
    objDiv.scrollTop = objDiv.scrollHeight;
}
