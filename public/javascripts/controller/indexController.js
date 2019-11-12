app.controller("indexController", [
  "$scope",
  "indexFactory",
  ($scope, indexFactory) => {
    $scope.init = () => {
      const username = prompt("please enter username");
      if (username) initSocket(username);
      else return false;
    };
    $scope.messages = [];
    $scope.players = {};

    function scrollTop() {
      setTimeout(() => {
        const element = document.getElementById('chat-area');
      element.scrollTop=element.scrollHeight;
      });
    }
    function initSocket(username) {
      const connectionOptions = {
        reconnectionAttempts: 3,
        reconnectionDelay: 600
      };
      function showBubble(id,message) {
        $('#'+id).find('.message').show().html(message);
        setTimeout(() => {
          $('#'+id).find('.message').hide();
        }, 2000);
      }
      indexFactory
        .connectSocket("http://localhost:3000", { connectionOptions })
        .then(socket => {
          socket.emit("newUser", { username });
          socket.on("initPlayers", players => {
            $scope.players = players;
            $scope.$apply();
            console.log(players);
          });
          socket.on("newUser", data => {
            const messageData = {
              type: {
                code: 0, //server or user message
                message: 1 //connect
              },
              username: data.username
            };
            $scope.messages.push(messageData);
            $scope.players[data.id] = data;
            $scope.$apply();
          });
          socket.on("disUser", data => {
            const messageData = {
              type: {
                code: 0,
                message: 0 //disconnect
              },
              username: data.username
            };
            $scope.messages.push(messageData);
            delete $scope.players[data.id];
            $scope.$apply();
          });
          socket.on('newMessage',message=>{
              $scope.messages.push(message);
              $scope.$apply();
              showBubble(message.socketId,message.text);
             scrollTop();
          });
          socket.on('animate',data=>{
            $("#" + data.socketId).animate({ left: data.x, top: data.y }, () => {
              animate = false;
            });
          });
          let animate = false;
          $scope.onClickPlayer = $event => {
            if (!animate) {
              let x = $event.offsetX;
              let y = $event.offsetY;
              socket.emit("animate", { x, y });
              animate = true;
              $("#" + socket.id).animate({ left: x, top: y }, () => {
                animate = false;
              });
            }
          };
          $scope.newMessage = ()=> {
            let message= $scope.message;
            const messageData = {
              type: {
                code: 1, //server or user message
                
              },
              username: username,
              text:message
            };
            $scope.messages.push(messageData);
            $scope.message='';
            socket.emit('newMessage',messageData);
            showBubble(socket.id,message);
           scrollTop();
          };
        })
        .catch(err => {
          console.log(err);
        });
    }
  }
]);
