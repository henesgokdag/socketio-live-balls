app.controller("indexController", [
  "$scope",
  "indexFactory",
  ($scope, indexFactory) => {
    $scope.init = () => {
      const username = prompt("please enter username");
      if (username) initSocket(username);
      else return false;
    };
    $scope.messages = [
     
    ];
    function initSocket(username) {
      const connectionOptions = {
        reconnectionAttempts: 3,
        reconnectionDelay: 600
      };
      indexFactory
        .connectSocket("http://localhost:3000", { connectionOptions })
        .then((socket) => {
		  socket.emit("newUser", { username });
		  socket.on('newUser',(data)=>{
			  const messageData= {
				  type:{
					  code:0, //server or user message
					message:1  //connect
				  }, 
				  username:data.username,

			  };
			  $scope.messages.push(messageData);
			  $scope.$apply();
		  });
		  socket.on('disUser',(data)=>{
			const messageData= {
				type:{
					code:0,
				  message:0 //disconnect
				}, 
				username:data.username
			};
			$scope.messages.push(messageData);
			$scope.$apply();
		  });
        })
        .catch(err => {
          console.log(err);
        });
    }
  }
]);
