function initialize() {
  //Setup Google Map
  var myLatlng = new google.maps.LatLng(17.7850,-12.4183);
  var myOptions = {
    zoom: 2,
    center: myLatlng,
    mapTypeId: google.maps.MapTypeId.ROADMAP,
    mapTypeControl: true,
    mapTypeControlOptions: {
      style: google.maps.MapTypeControlStyle.HORIZONTAL_BAR,
      position: google.maps.ControlPosition.LEFT_BOTTOM
    },
    
  };
  var map = new google.maps.Map(document.getElementById("map_canvas"), myOptions);
  var tweetwindow=document.getElementById("tweet");
  var profileWindow=document.getElementById("profile");
  //Setup heat map and link to Twitter array we will append data to
  var heatmap;
  var liveTweets = new google.maps.MVCArray();
  heatmap = new google.maps.visualization.HeatmapLayer({
    data: liveTweets,
    radius: 25
  });
  heatmap.setMap(map);

  if(io !== undefined) {
    // Storage for WebSocket connections
    var socket = io.connect('http://localhost:8081/');
    socket.on('twitter-stream', function (data) {

      //Add tweet to the heat map array.
      var tweetLocation = new google.maps.LatLng(data.lng,data.lat);
      liveTweets.push(tweetLocation);
      
      //Flash a image onto the map
      var image = "css/favicon-twitter.png";
      var marker = new google.maps.Marker({
        position: tweetLocation,
        map: map,
        icon: image
      });
      setTimeout(function(){
        marker.setMap(null);
      },600);
      
    });
    socket.on('tweet',function(data){
        var tweet=data.toString();
        //console.log("Received:"+tweet);
        tweetwindow.innerHTML="<p>"+tweet+"</p>";
    });
    socket.on('profile',function(data){
        var profile=data.toString();
        console.log("Received:"+profile);
        profileWindow.innerHTML="<img src="+profile+">";
    });
    // Listens for a success response from the server to 
    // say the connection was successful.
    socket.on("connected", function(r) {
      
      socket.emit("start tweets");
    });
  }
}
