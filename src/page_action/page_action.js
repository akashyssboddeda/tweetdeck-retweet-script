jQuery(document).ready(function($) {

    chrome.storage.sync.get("tweetdeck_options", function(obj) {
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

    $('#save').on('click', function() {
        $('#status').hide().removeClass();
        var store_obj, usernames, blacklistedUsernames, fileName, fileLocation, cycleWaitTime;

        usernames = $('#usernames').val();
        usernames = usernames.split(',');

        blacklistedUsernames = $('#blacklisted_usernames').val();
        blacklistedUsernames = blacklistedUsernames.split(',');

        cycleWaitTime = $('#cycle_wait_time').val();

        autoStart = $('#autostart').prop('checked');

        store_obj = {
            usernames: usernames,
            blacklistedUsernames: blacklistedUsernames,
            cycleWaitTime:cycleWaitTime,
            autoStart:autoStart
        };

        store_obj = JSON.stringify(store_obj);

        chrome.storage.sync.set({
            "tweetdeck_options": store_obj
        }, function() {
            $('#status').addClass('success').text('Saved').fadeIn();
        });
    });

    $('#start').on('click', function() {
        chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
          chrome.tabs.sendMessage(tabs[0].id, {message: "start"});
        });
    });

    $('#stop').on('click', function() {
        chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
          chrome.tabs.sendMessage(tabs[0].id, {message: "stop"});
        });
    });
});
