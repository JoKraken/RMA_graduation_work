import { Component, ViewChild, ElementRef } from '@angular/core';
import { NavController, NavParams } from 'ionic-angular';
import { HttpClientModule } from '@angular/common/http';
import { HttpModule } from '@angular/http';

import { Observable } from 'rxjs/Observable';
import { HttpClient } from '@angular/common/http';
import { Geolocation } from '@ionic-native/geolocation';
import { NativeGeocoder, NativeGeocoderForwardResult } from '@ionic-native/native-geocoder';

// @Component({
//   selector: 'maps-details',
//   templateUrl: 'maps-details.html',
// })
//
// export class MapDetailsPage {
//   item;
//   items = [];
//
//   constructor(params: NavParams) {
//     this.item = params;
//   }
// }


declare var google: any;

@Component({
  selector: 'page-about',
  templateUrl: 'about.html'
})
export class AboutPage {
  mode = [{name: "Auto", value: "DRIVING"},
          {name: "Laufen", value: "WALKING"},
          {name: "Öffentlich", value: "TRANSIT"}];
  modeString = "DRIVING";
  routeString ="";
  @ViewChild('map') mapElement: ElementRef;
  map: any;
  geocoder;
  locations = [{lat: 52.272984, lng: 8.0460331}];
  directionsService = new google.maps.DirectionsService;
  directionsDisplay;
  routeDetails;
  geoURL = "";

  countSearch = 0;
  country = "";
  countryArray = [];
  searchString = "";
  weatherArray = [];
  request: Observable<any>;

  constructor(
    // public MapDetailsPage: MapDetailsPage,
    private nativeGeocoder: NativeGeocoder,
    public navCtrl: NavController,
    public httpClient: HttpClient,
    private geolocation: Geolocation
  ) {}

  ionViewWillEnter(){}

  search(ev: any){
    document.querySelector("#errorCountry").style.display = "none";
    this.countSearch++;
    setTimeout(()=>{
      this.searchHelp(this.countSearch, ev);
    }, this.countSearch, ev, 3000);
  }

  searchHelp(param, ev: any){
    if(param == this.countSearch && document.querySelector(".country") != undefined
      && (document.querySelector(".country") as HTMLCollectionOf<HTMLElement>).style != undefined
    ){
      this.countSearch = 0;
      document.querySelector(".country").style.display = "none";
      document.querySelector("#weather").style.display = "none";
      if(ev != undefined)this.searchString = ev.target.value;

      let url = "";
      if(this.country.localeCompare("") == 0) url = 'http://api.wunderground.com/api/137581351957bfb1/forecast10day/q/'+this.searchString+'.json';
      else url = 'http://api.wunderground.com/api/137581351957bfb1/forecast10day'+this.country+'.json';

      this.request = this.httpClient.get(url);
      this.request
      .subscribe(data => {
        console.log(data);
        if(data.forecast != undefined){
          if(this.country.localeCompare("") == 0) this.geoURL = 'http://api.wunderground.com/api/137581351957bfb1/geolookup/q/'+this.searchString+'.json';
          else this.geoURL = 'http://api.wunderground.com/api/137581351957bfb1/geolookup'+this.country+'.json';
          console.log(this.geoURL);

          this.country = "";
          this.countryArray = [];
          let array = [];
          data.forecast.simpleforecast.forecastday.forEach(function(element) {
              // console.log(element);
              array.push(element);
          });
          this.weatherArray = array;
          document.querySelector("#weather").style.display = "block";
          this.loadMap();
          setTimeout(function () {
            document.querySelector(".weather").classList.remove("weatherNotFirst");
            document.querySelector(".weather").classList.add("weatherFirst");
            document.querySelector(".additive").style.display = "block";
            document.querySelector(".temp").style.display = "none";
            document.querySelector(".templow").style.display = "none";
          }, 10);
        }else if(data.response.results != undefined && data.response.results[0].name != undefined){
          document.querySelector(".country").style.display = "block";
          this.countryArray = data.response.results;
        }
       })
    }
  }

  onclickCountry(countryString, count){
    if(countryString == undefined){
      document.querySelector("#errorCountry").style.display = "none";
      count = 0;
      countryString = this.country;
    }
    setTimeout(()=>{
      if(countryString.localeCompare(this.country) == 0){
        count++;
        if(count < 15) this.onclickCountry(countryString, count);
        else{
          document.querySelector("#errorCountry").style.display = "block";
          setTimeout(()=>{
            document.querySelector("#errorCountry").style.display = "none";
          }, 4000);
        }
      }else{
        this.search();
      }
    }, 2000);
  }

  loadMap(){
    this.geolocation.getCurrentPosition().then((position) => {
      let latLng = new google.maps.LatLng(position.coords.latitude, position.coords.longitude);

      let mapOptions = {
        center: latLng,
        zoom: 13,
        mapTypeId: google.maps.MapTypeId.ROADMAP
      }

      this.map = new google.maps.Map(this.mapElement.nativeElement, mapOptions);

      var marker = new google.maps.Marker({
        map: this.map,
        animation: google.maps.Animation.DROP,
        position: latLng
      });

      this.startNavigating(position);
    }, (err) => {
      console.log(err);
    });
  }

  startNavigating(position){
    let directionsService = new google.maps.DirectionsService;
    let directionsDisplay = new google.maps.DirectionsRenderer;
    directionsDisplay.setMap(this.map);

    this.request = this.httpClient.get(this.geoURL);
    this.request
    .subscribe(data => {
      console.log(data.location);
      directionsService.route({
          origin: new google.maps.LatLng(position.coords.latitude, position.coords.longitude),
          destination: new google.maps.LatLng(data.location.lat, data.location.lon),
          travelMode: google.maps.TravelMode[this.modeString] //TRANSIT
      }, (res, status) => {
          if(status == google.maps.DirectionsStatus.OK){
              console.log(res.routes[0].legs[0]);
              this.routeString = res.routes[0].legs[0].distance.text+", "+res.routes[0].legs[0].duration.text;
              this.routeDetails = res.routes[0].legs[0];
              directionsDisplay.setDirections(res);
          } else {
              console.warn(status);
          }
      });
     })

  }

  onclickMode(mode, count){
    if(mode == undefined){
      count = 0;
      mode = this.modeString;
    }
    setTimeout(()=>{
      if(mode.localeCompare(this.modeString) == 0){
        count++;
        if(count < 15) this.onclickMode(mode, count);
      }else
        this.loadMap();
    }, 2000);
  }

  openMapDetailsPage(item) {
    // this.navCtrl.push(MapDetailsPage, { item: item });
  }

}
