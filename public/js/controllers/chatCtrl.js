APP.controller('chatController', function($scope, $firebase) {

  var ref = new Firebase("https://tiny-mean-app.firebaseio.com/chatLog");
  var chatFb = $firebase(ref);

  // var syncObject = chatFb.$asObject();
  $scope.messages = chatFb.$asArray();
  // syncObject.$bindTo($scope, 'messages');
  console.log($scope.messages);

  $('#messages').bind('DOMNodeInserted DOMNodeRemoved', function(event) {
    if (event.type == 'DOMNodeInserted') {
  		var element = $('#messages');
		element.scrollTop(element.prop("scrollHeight"));
	}
  })
  $scope.sendMessage = function($event) {
    if (!($event.which == 13)) return;
    if ($scope.message.length == 0) return;
 
    chatFb.$push({
      postedby: $scope.user.local.email,
      message: $scope.message,
      posteddate: Date.now(),
    });
 
    $scope.message = '';
  };
})