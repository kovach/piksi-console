// Global state
var last_hb;

var cc = 0;
var colors = ['#ff0000', '#00ff00', '#0000ff', '#ff00ff'];
var color = function() {
  return colors[cc++];
}

var plots = {};

var init = function(io) {
  last_hb = new Date().getTime();

  var piksiCoords = {};
  var polylines = {};
  var markers = {};

  var positioned = false;

  var handlers = {
    'pos_llh': function(msg) {
      var piksi = msg.piksi_id;
      piksiCoords[piksi] = piksiCoords[piksi] || [];
      piksiCoords[piksi].push(msg.point);

      if (!positioned) {
        window.map.setCenter(msg.point);
        window.map.setZoom(16);
        positioned = true;
      }

      // Set all markers
      for (var piksiId in piksiCoords) {
        var path = piksiCoords[piksiId];
        var pathBegin = path[0];
        var pathEnd = path[path.length - 1];
        markers[piksiId] = markers[piksiId] || {};

        markers[piksiId].begin = markers[piksiId].begin ||
          new google.maps.Marker({
            map: window.map,
            title: "Piksi " + piksiId + " path begin"
          });
        markers[piksiId].begin.setPosition(pathBegin);

        markers[piksiId].end = markers[piksiId].end ||
          new google.maps.Marker({
            map: window.map,
            title: "Piksi " + piksiId + " path end"
          });
        markers[piksiId].end.setPosition(pathEnd);
      }

      // Set all polylines
      for (var piksiId in piksiCoords) {
        var path = piksiCoords[piksiId];
        polylines[piksiId] = polylines[piksiId] ||
          new google.maps.Polyline({
            map: window.map,
            geodesic: true,
            strokeColor: colors[piksiId],
            strokeOpacity: 1.0,
            strokeWeight: 2
          });
        polylines[piksiId].setPath(path);
      }
    },
    'heartbeat': function(msg) {
      var now = new Date().getTime();
      last_hb = now;
    }
  }
  console.log('HELLO');
  io.input.add(handlers);
}

// TODO animate heartbeat, other messages?
var animate = function() {
  var now = new Date().getTime();
  var delta = Math.pow(1/2, (now - last_hb) / 3000);
  window.requestAnimationFrame(animate);
}

module.exports = init;
