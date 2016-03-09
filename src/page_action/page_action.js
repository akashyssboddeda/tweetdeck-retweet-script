jQuery(document).ready(function($) {

    chrome.storage.sync.get("tweetdeck_options", function(obj) {
        if (obj.tweetdeck_options) {
            updatePage(JSON.parse(obj.tweetdeck_options));
        }
    });

    function updatePage(obj) {
        $('#usernames').val(obj.usernames.toString() || null);
        $('#blacklisted_usernames').val(obj.blacklistedUsernames.toString() || null);
        $('#file_name').val(obj.fileName || null);
        $('#file_location').val(obj.fileLocation || null);
        $('#cycle_wait_time').val(obj.cycleWaitTime || 30);
    }

    $('#save').on('click', function() {
        $('#status').hide().removeClass();
        var store_obj, usernames, blacklistedUsernames, fileName, fileLocation, cycleWaitTime;

        usernames = $('#usernames').val();
        usernames = usernames.split(',');

        blacklistedUsernames = $('#blacklisted_usernames').val();
        blacklistedUsernames = blacklistedUsernames.split(',');

        fileName = $('#file_name').val();

        fileLocation = $('#file_location').val();

        cycleWaitTime = $('#cycle_wait_time').val();

        store_obj = {
            usernames: usernames,
            blacklistedUsernames: blacklistedUsernames,
            fileName: fileName,
            fileLocation: fileLocation,
            cycleWaitTime:cycleWaitTime
        };

        store_obj = JSON.stringify(store_obj);

        chrome.storage.sync.set({
            "tweetdeck_options": store_obj
        }, function() {
            $('#status').addClass('success').text('Saved').fadeIn();
        });
    });
});
