import { Component, ViewChild, ElementRef } from '@angular/core';
import { NavController, NavParams } from 'ionic-angular';
//import { HttpClientModule } from '@angular/common/http';
//import { HttpModule } from '@angular/http';
import { Storage } from '@ionic/storage';

import { Observable } from 'rxjs/Observable';
import { HttpClient } from '@angular/common/http';
import { Geolocation } from '@ionic-native/geolocation';
//import { NativeGeocoder, NativeGeocoderForwardResult } from '@ionic-native/native-geocoder';


@Component({
  selector: 'city-details',
  templateUrl: 'city-details.html',
})

export class CityDetailsPage {
  item;
  itemsMap;
  what = [{name: "Hotel", value: "Hotel"},
          {name: "Hostel", value: "Hostel"},
          {name: "Restaurant", value: "Restaurant"}];
  whatString = "Hotel";
  howMuch = [{name: "15", value: "15"},
          {name: "25", value: "25"},
          {name: "50", value: "50"}];
  howMuchString = "15";

  items = [];
  @ViewChild('map') mapElement: ElementRef;
  map: any;
  request: Observable<any>;

  constructor(
    public httpClient: HttpClient,
    params: NavParams
  ) {
    this.item = params.data.item;
    console.log(this.item);

    this.loadMap();
  }

  loadMap(){
    let params = 'v=20161017&ll='+this.item[0]+'%2C'+this.item[1]+'&query='+this.whatString+'&limit='+this.howMuchString
    +'&intent=checkin&client_id=BCUJZ2MSKUWJC2Q5HVIYZLHRWGFJ2OFPKPLBP1NOBNR3VW5R'
    +'&client_secret=Q10HUP5APBQOYNTPABSH4CSKRGEAI2CXIYULYGG0EZYUUWUZ';

    this.request = this.httpClient.get('https://api.foursquare.com/v2/venues/search?'+params);
    this.request.subscribe(data => {
      console.log(data.response.venues);

      let latLng = new google.maps.LatLng(this.item[0], this.item[1]);

      let mapOptions = {
        center: latLng,
        zoom: 12,
        mapTypeId: google.maps.MapTypeId.ROADMAP
      }

      this.map = new google.maps.Map(this.mapElement.nativeElement, mapOptions);

      this.itemsMap = data.response.venues;
      for(let i = 0; i < this.itemsMap.length; i++){
        let latLng = new google.maps.LatLng(this.itemsMap[i].location.lat, this.itemsMap[i].location.lng);

        var marker = new google.maps.Marker({
          map: this.map,
          title: "test",
          animation: google.maps.Animation.DROP,
          position: latLng
        });
      }
     })
  }

  onclickWhat(mode, count){
    if(mode == undefined){
      count = 0;
      mode = this.whatString;
    }
    setTimeout(()=>{
      if(mode.localeCompare(this.whatString) == 0){
        count++;
        if(count < 15) this.onclickWhat(mode, count);
      }else
        this.loadMap();
    }, 2000);
  }

  onclickHowMuch(mode, count){
    if(mode == undefined){
      count = 0;
      mode = this.howMuchString;
    }
    setTimeout(()=>{
      if(mode.localeCompare(this.howMuchString) == 0){
        count++;
        if(count < 15) this.onclickHowMuch(mode, count);
      }else
        this.loadMap();
    }, 2000);
  }
}


@Component({
  selector: 'maps-details',
  templateUrl: 'maps-details.html',
})

export class MapDetailsPage {
  item;
  steps;
  items = [];

  constructor(params: NavParams) {
    this.item = params;
    this.steps = params.data.item.steps;
    console.log(this.item);

    setTimeout(()=>{
        let string = document.querySelector("#instructions").innerHTML;
        for(let i = 0; i < this.steps.length; i++){
          string += "<button  style='background-color: #fff;width: 100%;padding: 16px;border-bottom: 1px solid #dedede'> "
            + this.steps[i].instructions + " (" +this.steps[i].distance.text +  ")</button > <br>";
        }
      document.querySelector("#instructions").innerHTML = string;
    }, this.steps, 100);

  }
}


declare var google: any;

@Component({
  selector: 'page-about',
  templateUrl: 'about.html'
})

export class AboutPage {
  settings;

  mode = [{name: "Auto", value: "DRIVING"},
          {name: "Laufen", value: "WALKING"},
          {name: "Öffentlich", value: "TRANSIT"}];
  modeString = "DRIVING";
  routeString ="";
  @ViewChild('map') mapElement: ElementRef;
  map: any;
  geocoder;
  locations = [];
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
    //private nativeGeocoder: NativeGeocoder,
    public nav: NavController,
    public httpClient: HttpClient,
    private geolocation: Geolocation,
    private storage: Storage
  ) {}

  ionViewWillEnter(){
    this.storage.get('settings').then((val) => {
      this.settings = JSON.parse(val);
      if(this.settings.gps){
        document.querySelector("#noGPS").style.display = "none";
        document.querySelector("#GPS").style.display = "block";
      }else{
        document.querySelector("#GPS").style.display = "none";
        document.querySelector("#noGPS").style.display = "block";
      }
      this.loadMap();
    });
  }

  search(ev: any){
    let elem = <HTMLElement>document.querySelector("#errorCountry");
    elem.style.display = "none";
    this.countSearch++;
    setTimeout(()=>{
      this.searchHelp(this.countSearch, ev);
    }, this.countSearch, ev, 4000);
  }

  searchHelp(param, ev: any){
    if(param == this.countSearch && document.querySelector(".country") != undefined
      && document.querySelector(".country").style != undefined
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
        //console.log(data);
        if(data.forecast != undefined){
          if(this.country.localeCompare("") == 0) this.geoURL = 'http://api.wunderground.com/api/137581351957bfb1/geolookup/q/'+this.searchString+'.json';
          else this.geoURL = 'http://api.wunderground.com/api/137581351957bfb1/geolookup'+this.country+'.json';
          //console.log(this.geoURL);

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
    if(this.settings.gps){
      this.geolocation.getCurrentPosition().then((position) => {
        let latLng = new google.maps.LatLng(position.coords.latitude, position.coords.longitude);

        let mapOptions = {
          center: latLng,
          zoom: 13,
          mapTypeId: google.maps.MapTypeId.ROADMAP
        }

        this.map = new google.maps.Map(this.mapElement.nativeElement, mapOptions);

        this.startNavigating(position);
      }, (err) => {
        console.log(err);
      });
    }
  }

  startNavigating(position){
    let directionsService = new google.maps.DirectionsService;
    let directionsDisplay = new google.maps.DirectionsRenderer;
    directionsDisplay.setMap(this.map);
    this.routeDetails = {};

    this.request = this.httpClient.get(this.geoURL);
    this.request
    .subscribe(data => {
      this.locations = [data.location.lat, data.location.lon];
      directionsService.route({
          origin: new google.maps.LatLng(position.coords.latitude, position.coords.longitude),
          destination: new google.maps.LatLng(data.location.lat, data.location.lon),
          travelMode: google.maps.TravelMode[this.modeString] //TRANSIT
      }, (res, status) => {
          if(status == google.maps.DirectionsStatus.OK){
            document.querySelector("#noResults").style.display = "none";
            document.querySelector("#routeSettings").style.display = "block";
              //console.log(res.routes[0].legs[0]);
              this.routeString = res.routes[0].legs[0].distance.text+" ("+res.routes[0].legs[0].duration.text+")";
              this.routeDetails = res.routes[0].legs[0];
              directionsDisplay.setDirections(res);
          } else {
              console.warn(status);
              document.querySelector("#routeSettings").style.display = "none";
              document.querySelector("#noResults").style.display = "block";
          }
      });
    },
    error => {
            console.log(error);
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
    this.nav.push(MapDetailsPage, { item: item });
  }

  openCityDetailsPage(item) {
    this.nav.push(CityDetailsPage, { item: item });
  }

}
