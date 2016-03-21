// ==UserScript==
// @name         tweetdeck Full RT script
// @namespace    http://tampermonkey.net/
// @version      1.0
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
var isCycleOver,tweetCounts,currentMuteUsername;
var currentAccount,scrollTimer;
var tweets = 0;
function start(){

    user = 0;
    currentMuteUsername = 0;
    currentAccount = 1;
    isCycleOver = false;
    firstTweetId = -1;
    tweetCount = 2;
    usernames = ['bilaleren17','justsomeguy1112','justsomeguy2223'];
    tweetCounts = [1,2,2];
    blacklistedUsername = ['vividdeck'];
    muteUsernames = ['alimaadelat'];
    waitTime = 1;
    currentUserName = '';
    scrollTimer = 5;
    scrollTimer = scrollTimer * 1000;
    generalWait = 1.5; //input in seconds -> bot speed
    generalWait = generalWait * 1000;
    waitTime = waitTime * 60; // converting to seconds
    waitTime = waitTime * 1000; //converting to milliseconds

    addBlackListOverlay();

    console.log('initializing values');
    addTamperLog('initializing values');

    if(sessionStorage.getItem('lastUser')){
    	user = sessionStorage.getItem('lastUser');
    	user = parseInt(user) + 1;
    	if(usernames.length-1 < user){
            console.log('when user# is more than usernames.length, reseting user position to 0');
            addTamperLog('when user# is more than usernames.length, reseting user position to 0');
    		user = 0;
    	}
    	console.log('retrieving username location from browser and username position is: username#'+user);
        addTamperLog('retrieving username location from browser and username position is: username#'+user);
    	sessionStorage.removeItem('lastUser');
    }

    onFirstLoadInit();
}

function addBlackListOverlay () {
	if(!$('#tamper-overlay').length){
		var div = '<div id="tamper-overlay" style="position: absolute;top: 0;left: 0;width: 100%;z-index: 1000;background: #28AB28;color: white;text-align: center;padding: 5px;"><h1 style="font-size:40px;">'+blacklistedUsername[0]+'</h1></div>';
		$('body').append(div);
	}
    if(!$('#tamper-logs').length){
        var div = '<div id="tamper-logs" style="height:80px;overflow:auto;position: absolute;bottom: 0;left: 0;width: 100%;z-index: 1000;background: #fff;color: black;text-align: center;padding: 5px;"><h1 style="font-size:40px;">Logs are added here</h1><div id="tamper-log"></div></div>';
		$('body').append(div);
    }
    if($('#tamper-log-btn').length){
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
            // if(muteUsernames.length){
            // 	checkMute();
            // }else{
            // 	startAccountClick();
            // }
            startAccountClick(); // bot has to check unmute and unblock after changing default account
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
        if($('#global_filter_settings #filter-results li').length){
        	clearInterval(timer);
            var limit = $('#global_filter_settings #filter-results li').length;
            $('#global_filter_settings #filter-results li').each(function(k,v){
                var text = $(v).text().replace('Muting user','');
                text = text.trim();
                text = text.slice(1,text.length-1);
                console.log('checking mute user: '+text+' present in muteUsernames or not');
                addTamperLog('checking mute user: '+text+' present in muteUsernames or not');
                setTimeout(function(v,text,k){
                    if(muteUsernames.indexOf(text)>=0){
                        console.log('cliking unmute');
                        addTamperLog('cliking unmute');
                        $(v).find('input').click();
                    }
                    console.log('index is '+k+' and limit is '+limit);
                    addTamperLog('index is '+k+' and limit is '+limit);
                    if(k == limit-1){
                        console.log('mute is done proceeding to unblock');
                        addTamperLog('mute is done proceeding to unblock');
                        setTimeout(function(){
                            checkUnblock();
                        },generalWait);
                    }
                }(v,text,k),generalWait);
            });
        }else{
        	clearInterval(timer);
        	checkUnblock();
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
	            		window.location.reload();
	            		return;
	            	}
	            	triggers++;
	                if($('.js-popover-content ul.list-divider.has-results li').length){
	                    $('.js-popover-content ul.list-divider.has-results li')[0].click();
	                    clearInterval(timer);
	                    setTimeout(function(){
	                    	if($('.js-modal-content .s-blocking div.block-text').length){
                                console.log('user is blocked');
                                addTamperLog('user is blocked');
	                    		$('.js-modal-content div.block-text').click();
	                    		setTimeout(function(){
	                    			$('.js-modal-content .sprite-close').click();
	                    			if(currentMuteUsername == muteUsernames.length -1){
	                    				console.log('unblock finished proceeding account click');
                                        addTamperLog('unblock finished proceeding account click');
	                    				startAccountClick();
	                    			}else{
	                    				currentMuteUsername++;
	                    				console.log('proceeding unblock for next username');
                                        addTamperLog('proceeding unblock for next username');
	                    				checkUnblock();
	                    			}
	                    		},100);
	                    	}else{
                                console.log('user is not blocked');
                                addTamperLog('user is not blocked');
	                    		if(currentMuteUsername == muteUsernames.length -1){
	                    			console.log('unblock finished proceeding username search to RT');
                                    addTamperLog('unblock finished proceeding username search to RT');
                    				clickSearchBtn();
                    			}else{
                    				currentMuteUsername++;
                    				console.log('proceeding unblock for next username');
                                    addTamperLog('proceeding unblock for next username');
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
            //clickSearchBtn();
            if(muteUsernames.length){
            	checkMute();
            }else{
            	clickSearchBtn();
            }
        },500);
    },generalWait);
}
function clickSearchBtn(){
	var triggers = 0;
    console.log('opening Search sidebar');
    addTamperLog('opening Search sidebar');
    var id = user;
    $('.js-app-header .app-search-fake').click();
    setTimeout(function(){
        console.log('entering search value: '+usernames[id]);
        addTamperLog('entering search value: '+usernames[id]);
        $('.js-popover-content input.search-input').val(usernames[id]);
        setTimeout(function(){
            $('.js-popover-content input.search-input').keypress();
            var timer = setInterval(function(){
            	if(triggers==5){
            		clearInterval(timer);
                    sessionStorage.setItem('lastUser',user);
                    setTimeout(function () {
                        window.location.reload();
                    },100);
            		return;
            	}
            	triggers++;
                if($('.js-popover-content ul.list-divider.has-results li').length){
                    $('.js-popover-content ul.list-divider.has-results li')[0].click();
                    clearInterval(timer);
                    clickLikes();
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
function clickLikes(){
    console.log('clicking Like button');
    addTamperLog('clicking Like button')
    var timer = setInterval(function(){
        if($('.js-modal-content .icon.icon-favorite').length){
            clearInterval(timer);
            $('.js-modal-content .icon.icon-favorite').click();
            setTimeout(function(){
                loadTweets();
            },(generalWait*3));
        }else{
            if($('.js-popover-content ul.list-divider.has-results li').length){
                $('.js-popover-content ul.list-divider.has-results li')[0].click();
            }
        }
    },generalWait);
}

function loadTweets(){
    var scrollHeight = 100000;
    var d = jQuery('.js-column-content .js-column-scroller.js-dropdown-container.scroll-alt');
        d = d[0];

    setTimeout(function () {
        getTweets();
    },(generalWait*5));

    function getTweets(){
        if($('.js-modal-panel .js-column-holder .js-column-content .js-chirp-container').length && $('.js-modal-panel .js-column-holder .js-column-content .js-chirp-container article').length){
            tweets = $(d).find('article.stream-item').length;
            $(d).scrollTop(scrollHeight);
            setTimeout(function(){
                if(tweets != $(d).find('article.stream-item').length){
                    getTweets();
                    console.log('scrolling tweets');
                    addTamperLog('scrolling tweets');
                    scrollHeight+=100000;
                }else{
                    clickRandomTweet();
                }
            },scrollTimer);
        }else{
        	console.log('No liked tweets, Goint to Change default account : '+currentAccount+ 'and waiting for '+generalWait/1000+' seconds');
            addTamperLog('No liked tweets, Goint to Change default account : '+currentAccount+ 'and waiting for '+generalWait/1000+' seconds');
            setTimeout(function(){
            	console.log('closing search sidebar');
                addTamperLog('closing search sidebar');
                $('.js-app-header .app-search-fake').click();
                currentAccount++;
                onFirstLoadInit();
            },generalWait);
        }
    }

}

function clickRandomTweet(){
    var timer = setInterval(function(){
        if($('.js-modal-panel .js-column-holder .js-column-content .js-chirp-container').length && $('.js-modal-panel .js-column-holder .js-column-content .js-chirp-container article').length){
            clearInterval(timer);
            var length = $('.js-modal-panel .js-column-holder .js-column-content .js-chirp-container article').length;
            var random = Math.floor(Math.random()*length);
            while(firstTweetId==random){
                random = Math.floor(Math.random()*length);
            }
            console.log('selecting Random Tweet: '+random);
            addTamperLog('selecting Random Tweet: '+random);
            firstTweetId = random;
            var tweet = $('.js-modal-panel .js-column-holder .js-column-content .js-chirp-container article:eq('+random+')');
            $(tweet).find('.icon-retweet').click();
            console.log('calling selectUsersAndTweet');
            addTamperLog('calling selectUsersAndTweet');
            selectUsersAndTweet();
        }
    },generalWait);
}
function selectUsersAndTweet(){
    console.log('inside selectUsersAndTweet');
    addTamperLog('inside selectUsersAndTweet');
    if(tweetCounts[user] == 1){
    	doSingleRT();
    }else{
    	doDoubleRT();
    }
}

function doSingleRT(){
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
                addTamperLog('Clicking Retweet Button')
                $('#actions-modal .js-retweet-button').click();
                setTimeout(function(){
                	$('#actions-modal .icon-close').click();
                	afterClickingRetweet();
                },generalWait);
            },generalWait);
        }
    },generalWait);
}

function doDoubleRT(){
	var timer = setInterval(function(){
        if($('#actions-modal .js-account-selector li').length){
            clearInterval(timer);
            var users = $('#actions-modal .js-account-selector li');
            var userlimit = Math.floor(users.length/2);
            if(tweetCount==2){
                console.log('selecting users for first tweet');
                addTamperLog('selecting users for first tweet')
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
                addTamperLog('selecting users for second tweet');
                for(var i = 0;i<userlimit;i++){
                    var v = users[i];
                    var username = $(v).attr('title') || $(v).attr('data-original-title');
                    username = username.toLowerCase();
                    if(username == currentUserName){
                        $(v).click();
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
                addTamperLog('Clicking Retweet Button');
                $('#actions-modal .js-retweet-button').click();
                tweetCount--;
                setTimeout(function(){
                	$('#actions-modal .icon-close').click();
                	afterClickingRetweet();
                },generalWait);
            },generalWait);
        }
    },generalWait);
}

function afterClickingRetweet(){
	if(tweetCounts[user]==2){
        console.log('this is double tweet username');
        addTamperLog('this is double tweet username');
		if(!tweetCount){
	        tweetCount = 2;
	        user++;
            console.log('incremented user, current username is user#'+user);
            addTamperLog('incremented user, current username is user#'+user);
	        if(usernames.length != user){
	        	console.log('changing username and waiting for '+(generalWait/1000)+' seconds');
                addTamperLog('changing username and waiting for '+(generalWait/1000)+' seconds');
	            setTimeout(function(){
	                clickSearchBtn();
	            },generalWait);
	        }else{
	            if(isCycleOver){
	            	console.log('cycle over starting again in '+waitTime/60000+' minutes');
                    addTamperLog('cycle over starting again in '+waitTime/60000+' minutes');
	                setTimeout(function(){
	                	console.log('closing search sidebar');
                        addTamperLog('closing search sidebar');
	                	$('.js-app-header .app-search-fake').click();
	                    start();
	                },waitTime);
	            }else{
	            	console.log('Goint to Change default account : '+currentAccount+ 'and waiting for '+waitTime/60000+' minutes');
                    addTamperLog('Goint to Change default account : '+currentAccount+ 'and waiting for '+waitTime/60000+' minutes');
                    setTimeout(function(){
	                	console.log('closing search sidebar');
                        addTamperLog('closing search sidebar');
                        $('.js-app-header .app-search-fake').click();
	                    currentAccount++;
	                    user = 0;
                        console.log('resetting user to zero, current username is username#'+user);
                        addTamperLog('resetting user to zero, current username is username#'+user);
	                    onFirstLoadInit();
	                },waitTime);
	            }
	        }
	    }else{
	        setTimeout(function(){
	            clickSearchBtn();
	        },generalWait);
	    }
	}else{
        console.log('this is single tweet username');
        addTamperLog('this is single tweet username');
		user++;
        console.log('incremented user, current username is user#'+user);
        addTamperLog('incremented user, current username is user#'+user);
        if(usernames.length != user){
        	console.log('changing username and waiting for '+(generalWait/1000)+' seconds');
            addTamperLog('changing username and waiting for '+(generalWait/1000)+' seconds');
            setTimeout(function(){
                onFirstLoadInit();
            },generalWait);
        }else{
            if(isCycleOver){
                console.log('cycle over starting again');
                addTamperLog('cycle over starting again');
                setTimeout(function(){
                    start();
                },waitTime);
            }else{
                console.log('Repeating process for another user: #'+currentAccount+' waiting for '+(waitTime/60000)+' minutes');
                addTamperLog('Repeating process for another user: #'+currentAccount+' waiting for '+(waitTime/60000)+' minutes');
                setTimeout(function(){
                    currentAccount++;
                    user = 0;
                    console.log('resetting user to zero, current username is username#'+user);
                    addTamperLog('resetting user to zero, current username is username#'+user);
                    onFirstLoadInit();
                },waitTime);
            }
        }
	}
}
// Your code here...

function addTamperLog(log){
    log = new Date() + ' '+ log;
    $('#tamper-log').append('<p>'+log+'</p>');
    var objDiv = document.getElementById("tamper-logs");
    objDiv.scrollTop = objDiv.scrollHeight;
}
