chrome.extension.onMessage.addListener(
    function(request, sender, sendResponse) {
        if(request.log){
            $('#logs').append('<p>'+request.log+'</p>');
            var opt = {
                type: "basic",
                title: "PixelsTech Website Statistic Viewer",
                message: "1,000,000",
                iconUrl: "../../icons/icon.png"
            };
            chrome.notifications.create(getNotificationId(), opt, function() {});
        }
});

function getNotificationId() {
  var id = Math.floor(Math.random() * 9007199254740992) + 1;
  return id.toString();
}

function selectText(containerid) {
    if (document.selection) {
        var range = document.body.createTextRange();
        range.moveToElementText(document.getElementById(containerid));
        range.select();
    } else if (window.getSelection) {
        var range = document.createRange();
        range.selectNode(document.getElementById(containerid));
        window.getSelection().addRange(range);
    }
}

$('#selectAll').on('click',function () {
    selectText('logs');
});
