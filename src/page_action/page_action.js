jQuery(document).ready(function($) {

    chrome.storage.local.get("tweetdeck_options", function(obj) {
        if (obj.tweetdeck_options) {
            updatePage(JSON.parse(obj.tweetdeck_options));
        }
    });

    function updatePage(obj) {
        $('#usernames').val(obj.usernames.toString() || null);
        $('#blacklisted_usernames').val(obj.blacklistedUsernames.toString() || null);
        $('#cycle_wait_time').val(obj.cycleWaitTime || 30);
        $('#autostart').prop('checked',obj.autoStart);
    }

    $('#delete').on('click', function() {
        $('#status').hide().removeClass();
        chrome.storage.local.clear(function(){
            $('#status').addClass('success').text('Deleted').fadeIn();
        });
    });

    $('#save').on('click', function() {
        $('#status').hide().removeClass();
        var store_obj, usernames, blacklistedUsernames, fileName, fileLocation, cycleWaitTime;

        usernames = $('#usernames').val();
        usernames = usernames.trim();

        if(!usernames){
            $('#status').addClass('error').text('Please fill usernames').fadeIn();
            return;
        }

        usernames = usernames.toLowerCase();
        usernames = usernames.split(',');

        blacklistedUsernames = $('#blacklisted_usernames').val();
        blacklistedUsernames = blacklistedUsernames.trim();
        if(blacklistedUsernames){
            blacklistedUsernames = blacklistedUsernames.toLowerCase();
            blacklistedUsernames = blacklistedUsernames.split(',');
        }else{
            blacklistedUsernames = [];
        }

        cycleWaitTime = $('#cycle_wait_time').val();

        autoStart = $('#autostart').prop('checked');

        store_obj = {
            usernames: usernames,
            blacklistedUsernames: blacklistedUsernames,
            cycleWaitTime:cycleWaitTime,
            autoStart:autoStart
        };

        store_obj = JSON.stringify(store_obj);

        chrome.storage.local.set({
            "tweetdeck_options": store_obj
        }, function() {
            $('#status').addClass('success').text('Saved. Please refresh the page').fadeIn();
        });
    });

    $('#start').on('click', function() {
        $('#status').hide().removeClass();
        chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
          $('#open_logs')[0].click();
          $('#status').addClass('success').text('Started').fadeIn();
          chrome.tabs.sendMessage(tabs[0].id, {message: "start"});
        });
    });

    $('#stop').on('click', function() {
        $('#status').hide().removeClass();
        chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
            $('#status').addClass('success').text('Stopped').fadeIn();
          chrome.tabs.sendMessage(tabs[0].id, {message: "stop"});
        });
    });
});
