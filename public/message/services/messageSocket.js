APP.factory('socket', function(socketFactory, identityService) {
    var socket = socketFactory();
    socket.forward('newMessage');
    if (identityService.isAuthenticated()) {
        socket.emit('createRoom', {id: identityService.currentUser._id});
    }
    return socket;
});
