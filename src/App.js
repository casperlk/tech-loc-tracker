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
const TECH_LOC_API_URL = 'http://127.0.0.1:5000/' + '/api/v' + apiVersionNumber + '/solar_farms/' + farmID + '/'
var map
toast.configure() //notification system
var currentMarkers = [] //contains all currently displayed pins

// Requests geoJSON of technician locations from API
async function apiRequest() {
  let myPromise = new Promise(function(myResolve, myReject) {
    var request = new XMLHttpRequest()
    request.open('GET', TECH_LOC_API_URL + 'technicians', true)
    request.onload = function () {
      var data = JSON.parse(this.response)
      
      if (request.status >= 200 && request.status < 400) {
        renderPins(data)
      } else {
        console.log('error')
      }
    }
    request.send()
  })
}

// Requests pairs of colocated techs from API
async function apiColocRequest() {
  let myPromise = new Promise(function(myResolve, myReject) {
    var request = new XMLHttpRequest()
    request.open('GET', TECH_LOC_API_URL + 'colocated_technicians', true)
    request.onload = function () {
      var data = JSON.parse(this.response)
      
      if (request.status >= 200 && request.status < 400) {
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

// Removes existing markers on load of fresh location data
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

// Removes existing pins and creates a new pin for each technician
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
      zoom: 13.5,
    });

    refreshLocations()

    // add navigation control (the +/- zoom buttons)
    map.addControl(new mapboxgl.NavigationControl(), 'bottom-right');

    // clean up on unmount
    return () => map.remove();
  }, []);

  const popUpRef = useRef(new mapboxgl.Popup({ offset: 15 }));

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
}

export default App;