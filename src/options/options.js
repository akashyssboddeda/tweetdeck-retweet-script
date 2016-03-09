chrome.extension.onMessage.addListener(
    function(request, sender, sendResponse) {
        if(request.log){
            var date = new Date();
            $('#logs').append('<p>'+date+' '+request.log+'</p>');
        }
});

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
