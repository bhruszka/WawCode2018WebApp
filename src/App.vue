<template>
  <v-app>
    <v-navigation-drawer persistent :clipped="clipped" v-model="drawer" enable-resize-watcher fixed app mobile-break-point="0" width="400" class="no-scroll smart-nav">
      <v-toolbar flat>
        <v-list class="pa-0" avatar>
          <v-list-tile v-if="place">
            <v-list-tile-content style="max-width: 60px">
              <img :src="place.picture.data.url" />
            </v-list-tile-content>
            <v-list-tile-content class="place-title-container">
              <a :href="place.link">
                <v-list-tile-title class="place-title">
                  {{ place.name }}
                </v-list-tile-title>
              </a>
            </v-list-tile-content>
          </v-list-tile>
        </v-list>
      </v-toolbar>
      <v-layout row wrap class="left-scroll">
        <v-layout row wrap class="right-side">
          <v-flex xs12 v-if="place">
            <v-card>
              <v-card-text style="text-align: left">
                <p v-if="place.description.length > 0">
                  {{place.description}}
                </p>
                <p style="text-align: left">
                  <b>Adress: </b>{{place.location.street + ", " + place.location.city}}
                </p>
              </v-card-text>
            </v-card>
          </v-flex>
          <v-flex xs12>
            <v-card flat class="card mb-0">
              <v-card-title primary-title style="text-align: left">
                <div>
                  <h3 class="headline mb-2 mt-0">{{place ? "Wpisy na temat restauracji:" : "Wybierz miejsce na mapie"}}</h3>

                </div>
              </v-card-title>
            </v-card>
          </v-flex>
          <v-flex xs12 v-for="post in posts">
            <a :href="post.url">
              <v-card class="card">
                <v-img :src="post.image"></v-img>
                <v-card-title primary-title style="text-align: left">
                  <div>
                    <h3 class="headline mb-2 mt-0">{{post.title}}</h3>
                    <div>{{post.description}}.</div>
                  </div>
                </v-card-title>
              </v-card>
            </a>
          </v-flex>
          <v-spacer />
        </v-layout>
      </v-layout>
    </v-navigation-drawer>
    <v-toolbar app :clipped-left="clipped">
      <v-toolbar-side-icon @click.stop="drawer = !drawer"></v-toolbar-side-icon>
      <v-btn icon v-on:click="getLocation">
        <v-icon>location_searching</v-icon>
      </v-btn>
      <v-toolbar-title v-text="title"></v-toolbar-title>
      <v-spacer />
      <v-toolbar-title v-text="short_adress">>
      </v-toolbar-title>
    </v-toolbar>
    <v-content>
      <div id="mapid" class="map">
      </div>
    </v-content>
    <v-footer :fixed="fixed" app>
      <span>&copy; 2017</span>
    </v-footer>
  </v-app>
</template>

<script>
import firebase from "firebase/app";
import "firebase/firestore";

export default {
  name: "App",
  data() {
    return {
      clipped: false,
      drawer: false,
      db: null,
      fixed: false,
      title: "Agregator blogów na temat restauracji w Warszawie",
      place: null,
      places: [],
      posts: [],
      map: null,
      short_adress: "https://bit.ly/2PFzn1O",
      location_marker: null
    };
  },
  created() {
    firebase.initializeApp({
      apiKey: "AIzaSyCAaHg5n_pCrfKKL8RbDZgnrwpe9HGl1o0",
      authDomain: "wawcode-742bf.firebaseapp.com",
      projectId: "wawcode-742bf"
    });

    this.db = firebase.firestore();

    this.db.settings({ timestampsInSnapshots: true });
  },
  mounted() {
    this.map = L.map("mapid").setView([52.2297, 21.0122], 13);
    L.tileLayer(
      "https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}",
      {
        attribution:
          'Map data &copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors, <a href="https://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery © <a href="https://www.mapbox.com/">Mapbox</a>',
        maxZoom: 18,
        id: "mapbox.streets",
        accessToken:
          "pk.eyJ1IjoiYmhydXN6a2EiLCJhIjoiY2puN2cyaXJxMGR5aDNzcWlhZGRpMHQ5eSJ9.l8e5GKxf-AaKA6dE0yzYHw"
      }
    ).addTo(this.map);

    var self = this;
    this.db
      .collection("places")
      .get()
      .then(function(querySnapshot) {
        self.places = [];
        querySnapshot.forEach(function(doc) {
          self.places.push(doc.data());
        });
        self.initPopups();
      })
      .catch(function(error) {
        console.log("Error getting documents: ", error);
      });
  },
  methods: {
    getLocation: function() {
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(this.setLocation);
      } else {
        return false;
      }
    },
    setLocation: function(position) {
      console.log(position);
      console.log(this.location_marker);
      this.map.setView(
        [position.coords.latitude, position.coords.longitude],
        15
      );
      if (this.location_marker === null) {
        console.log(this.location_marker);
        var redMarker = L.AwesomeMarkers.icon({
          icon: "male",
          markerColor: "red"
        });
        this.location_marker = L.marker(
          [position.coords.latitude, position.coords.longitude],
          { icon: redMarker }
        ).addTo(this.map);
      }
      // this.map.setZoom(16);
      // this.map.panTo(
      //   new L.LatLng(position.coords.latitude, position.coords.longitude)
      // );
    },
    initPopups: function() {
      this.places.forEach(place => {
        var location = place.location;
        var marker = L.marker([location.latitude, location.longitude]).addTo(
          this.map
        );

        var popup = L.popup({
          autoClose: false,
          closeOnClick: false,
          closeButton: false,
          className: "map-popup"
        })
          .setLatLng([location.latitude, location.longitude])
          .setContent(`<b>${place.name}</b>`)
          .openOn(this.map)
          .openPopup();
        popup.place = place;
        var self = this;
        L.DomEvent.on(popup._contentNode, "click", function(e) {
          popup.bringToFront();
          popup.front = true;
          self.drawer = true;
          self.place = popup.place;
          self.db
            .collection("posts")
            .where("place_id", "==", self.place.id)
            .get()
            .then(function(querySnapshot) {
              self.posts = [];
              querySnapshot.forEach(function(doc) {
                self.posts.push(doc.data());
              });
            })
            .catch(function(error) {
              console.log("Error getting documents: ", error);
            });
        });
        L.DomEvent.on(popup._contentNode, "mouseover", function(e) {
          console.log(e);
          popup.bringToFront();
        });

        marker.bindPopup(popup).openPopup();
      });
      this.getLocation();
    }
  }
};
</script>
<style>
.map {
  height: 100%;
}
.map-popup {
  background-color: rgba(255, 255, 255, 0.8) !important;
}

.map-popup:hover {
  background-color: rgba(255, 255, 255, 1) !important;
  -webkit-transform: translateX(-5px);
  -moz-transform: translateX(-5px);
  -ms-transform: translateX(-5px);
  -o-transform: translateX(-5px);
  transform: translateX(-5px);
}

.map-popup:hover .leaflet-popup-content {
  background-color: rgba(255, 255, 255, 1) !important;
  padding: 5px !important;
  width: auto !important;
  max-width: 400px;
  white-space: wrap;
  overflow: hidden;
  text-overflow: ellipsis;
  min-width: 120px;
}

.map-popup > div {
  background-color: rgba(255, 255, 255, 0) !important;
}

.leaflet-popup-content {
  margin: 8px !important;
  text-align: center;
  vertical-align: middle;
  max-width: 120px;
  width: 120px !important;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.left-scroll {
  direction: rtl !important;
  overflow-y: auto;
  height: calc(100% - 64px);
  align-items: flex-start;
  justify-content: flex-start;
}

.right-side {
  direction: ltr !important;
}

.no-scroll {
  overflow: hidden;
}

.card {
  margin-top: 5px;
}

a {
  all: unset;
}

.leaflet-popup-tip-container {
  left: 68px !important;
}

.place-title {
  text-overflow: ellipsis;
  color: black;
  white-space: nowrap;
  overflow: hidden;
  max-width: 300px;
  margin-left: 10px;
}
</style>
