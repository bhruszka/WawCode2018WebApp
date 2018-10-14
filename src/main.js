import '@babel/polyfill'
import Vue from "vue";
import './plugins/vuetify'
import App from "./App.vue";
import './assets/css/leaflet.awesome-markers.css';
import './assets/js/leaflet.awesome-markers'


Vue.config.productionTip = false;

new Vue({
  render: h => h(App)
}).$mount("#app");

L.AwesomeMarkers.Icon.prototype.options.prefix = 'icon';