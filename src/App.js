import React, { useRef, useEffect } from 'react';
import ReactDOM from 'react-dom';
import Popup from './popup.js';
import mapboxgl from 'mapbox-gl';
import './App.css';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

mapboxgl.accessToken = process.env.REACT_APP_.API_KEY

var farmID = '000001'
var apiVersionNumber = '1'
const TECH_LOC_API_URL = 'http://127.0.0.1:5000' + '/api/v' + apiVersionNumber + '/solar_farms/' + farmID + '/' //http://127.0.0.1:5000/  https://tech-loc-api.herokuapp.com
var geoJSON;
var map
toast.configure()
var currentMarkers = []

async function apiRequest() {
  let myPromise = new Promise(function(myResolve, myReject) {
    var request = new XMLHttpRequest()
    request.open('GET', TECH_LOC_API_URL + 'technicians', true)
    request.onload = function () {
      var data = JSON.parse(this.response)
      
      if (request.status >= 200 && request.status < 400) {
        console.log(this.response)
        geoJSON = data
        renderPins(data)
      } else {
        console.log('error')
      }
    }
    request.send()
  })
}

async function apiColocRequest() {
  let myPromise = new Promise(function(myResolve, myReject) {
    var request = new XMLHttpRequest()
    request.open('GET', TECH_LOC_API_URL + 'colocated_technicians', true)
    request.onload = function () {
      var data = JSON.parse(this.response)
      
      if (request.status >= 200 && request.status < 400) {
        console.log(this.response)

        data.forEach(function(techPair) {
          toast("Colocated Technicians: "+ techPair)
        })

      } else {
        console.log('error')
      }
    }
    request.send()
  })

}


function removeExistingMarkers() {
  if (currentMarkers!==null) {
    for (var i = currentMarkers.length - 1; i >= 0; i--) {
      currentMarkers[i].remove();
    }
}
}

function refreshLocations() {
  apiRequest()
  apiColocRequest()
}

function renderPins(data) {
      removeExistingMarkers();
      data.features.forEach(function(marker) {
      // create a HTML element for each feature
      var el = document.createElement('div');
      el.className = 'marker';
      // make a marker for each feature and add to the map
      var marker = new mapboxgl.Marker({
        rotation: marker.properties.bearing+180,
        name: marker.properties.name
      })
        .setLngLat(marker.geometry.coordinates)
        .addTo(map)
        .setPopup(new mapboxgl.Popup({ offset: 30 }) // add popups
        .setHTML('<h3>' + marker.properties.name + '</h3>'));
        console.log("marker properties: ")
        currentMarkers.push(marker)
    });
}



function App() {
  const mapContainerRef = useRef(null);

  // initialize map when component mounts
  useEffect(() => {
    map = new mapboxgl.Map({
      container: mapContainerRef.current,
      style: 'mapbox://styles/mapbox/satellite-streets-v11',
      center: [-115.606391900599817, 32.673693943392962],
      zoom: 12.5,
    });

    map.on('click', 'random-points-layer', e => {
      if (e.features.length) {
        const feature = e.features[0];
        // create popup node
        const popupNode = document.createElement('div');
        ReactDOM.render(<Popup feature={feature} />, popupNode);
        // set popup on map
        popUpRef.current.setLngLat(feature.geometry.coordinates).setDOMContent(popupNode).addTo(map);
      }
    });

    // change cursor to pointer when user hovers over a clickable feature
    map.on('mouseenter', 'random-points-layer', e => {
      if (e.features.length) {
        map.getCanvas().style.cursor = 'pointer';
      }
    });

    // reset cursor to default when user is no longer hovering over a clickable feature
    map.on('mouseleave', 'random-points-layer', () => {
      map.getCanvas().style.cursor = '';
    });



    refreshLocations()

    

    

    console.log('geoJSON: ' + geoJSON);
    // add navigation control (the +/- zoom buttons)
    map.addControl(new mapboxgl.NavigationControl(), 'bottom-right');

    // clean up on unmount
    return () => map.remove();
  }, []);

  const popUpRef = useRef(new mapboxgl.Popup({ offset: 15 }));

  // const notify = () => toast("Colocated Technicians: ");
  return (
    <div>
      <div>
      <button onClick={refreshLocations}>Refresh Locations</button>
      </div>
      
      <div>
      <div className="map-container" ref={mapContainerRef} />
      </div>
      
      
      
      <ToastContainer />
    </div>
  );
  // return <div className="map-container" ref={mapContainerRef} />;
}

export default App;