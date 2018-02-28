import { Component, ViewChild, ElementRef } from '@angular/core';
import { NavController, NavParams } from 'ionic-angular';
import { Storage } from '@ionic/storage';

import { Observable } from 'rxjs/Observable';
import { HttpClient } from '@angular/common/http';
import { Geolocation } from '@ionic-native/geolocation';

import { CityDetailsPage } from '../about/city-details';
import { MapDetailsPage } from '../about/maps-details';


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
  uniqueCityString = "";
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
    params: NavParams,
    public nav: NavController,
    public httpClient: HttpClient,
    private geolocation: Geolocation,
    private storage: Storage
  ) {
    //console.log(params.data.item);
    this.getSettings();
    if(params.data.item != undefined){
      this.searchString = params.data.item[2];
      this.country = params.data.item[3];
      this.location = [params.data.item[0], params.data.item[1]];
      setTimeout(()=>{
        document.querySelector("#title").style.display = "none";
        document.querySelector("#search").style.display = "none";
        document.querySelector("#title_String").style.display = "block";
        this.searchHelp(this.countSearch);
      }, params, 10);
    }
  }

  getSettings(){
    this.storage.get('settings').then((val) => {
      this.settings = JSON.parse(val);
      if(this.settings!= null && this.settings.gps){
        document.querySelector("#noGPS").style.display = "none";
        document.querySelector("#GPS").style.display = "block";
      }else{
        document.querySelector("#GPS").style.display = "none";
        document.querySelector("#noGPS").style.display = "block";
      }
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
        this.searchHelpInnerRequest(data);
       })
    }
  }

  searchHelpInnerRequest(data){
    if(data.forecast != undefined){
      if(this.country.localeCompare("") == 0){
        this.geoURL = 'http://api.wunderground.com/api/137581351957bfb1/geolookup/q/'+this.searchString+'.json';
      }
      else {
        this.geoURL = 'http://api.wunderground.com/api/137581351957bfb1/geolookup'+this.country+'.json';
        this.uniqueCityString = this.country;
      }

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
      }, 50);
    }else if(data.response.results != undefined && data.response.results[0].name != undefined){
      this.countryArray = data.response.results;
      if(this.countryArray.length != 0) document.querySelector(".country").style.display = "block";
    }
  }

  loadMap(){
    this.cityIsInFavorites();
    if(this.settings != null && this.settings.gps){
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
      //console.log(data);
      if(data.location != undefined && this.searchString.toLowerCase().localeCompare(data.location.city.toLowerCase()) == 0) this.searchString = data.location.city;
      if(data.location != undefined){
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
            this.addViewHistory(this.locations);
        });
      }else{
        document.querySelector("#routeSettings").style.display = "none";
        document.querySelector("#noResults").style.display = "block";
      }
    },
    error => {
            console.log(error);
        })

  }

  //cityList = [lat, lng, cityname, uniqueCityString, count, firstFive, favorites]
  addViewHistory(locations){
    if(this.settings.viewHistory){
      this.storage.get('cityList').then((val) => {
        let viewHistory = JSON.parse(val);
        if(viewHistory == null){
          viewHistory = [[locations[0], locations[1], this.searchString, this.uniqueCityString, 1, "block", "none"]];
        }else{
          let isIn = 0;
          for(let i = 0; i < viewHistory.length; i++){
            if(viewHistory[i][0] == locations[0] && viewHistory[i][1] == locations[1]){
              viewHistory[i][4]++;
              isIn = 1;
            }
          }
          if(isIn == 0) viewHistory.push([locations[0], locations[1], this.searchString, this.uniqueCityString, 1, "none", "none"]);

          //viewHistory sortieren
          for(let i = 0; i < viewHistory.length; i++){
            for(let a = 0; a < viewHistory.length; a++){
              if(a > 4) viewHistory[a][5] = "none";
              else viewHistory[a][5] = "block";

              if(viewHistory[a+1] != undefined && viewHistory[a][4] < viewHistory[a+1][4]){
                let temp = viewHistory[a];
                viewHistory[a] = viewHistory[a+1];
                viewHistory[a+1] = temp;
              }
            }
          }
        }

        this.storage.set('cityList', JSON.stringify(viewHistory));
      });
    }
  }

  cityIsInFavorites(){
    this.storage.get('cityList').then((val) => {
      let favorites = JSON.parse(val);
      if(favorites == null) favorites = [];

      let isIn = 0;
      for(let a = 0; a < favorites.length; a++){
        if(favorites[a][6] == "block" && favorites[a][0] == this.locations[0] && favorites[a][1] == this.locations[1]){
          isIn = 1;
        }else if(favorites[a][6] == "block" && this.locations.length == 0 && favorites[a][2] == this.searchString){
          isIn = 1;
        }
      }

      if(isIn == 0){
         document.querySelector("#saveAsFavorites").style.display = "block";
         document.querySelector("#deleteFavorites").style.display = "none";
      }else{
         document.querySelector("#deleteFavorites").style.display = "block";
         document.querySelector("#saveAsFavorites").style.display = "none";
      }
    });
  }

  saveAsFavorites(){
    this.storage.get('cityList').then((val) => {
      let favorites = JSON.parse(val);
      if(favorites == null) favorites = [];
      for(let a = 0; a < favorites.length; a++){
        if(favorites[a][0] == this.locations[0] && favorites[a][1] == this.locations[1]){
          favorites[a][6] = "block";
        }else if(this.locations.length == 0 && favorites[a][2] == this.searchString){
          favorites[a][6] = "block";
        }
      }
      //console.log(favorites);
      this.storage.set('cityList', JSON.stringify(favorites));
      document.querySelector("#deleteFavorites").style.display = "block";
      document.querySelector("#saveAsFavorites").style.display = "none";
    });
  }

  deleteFavorites(){
    this.storage.get('cityList').then((val) => {
      let favorites = JSON.parse(val);

      for(let a = 0; a < favorites.length; a++){
        if(favorites[a][0] == this.locations[0] && favorites[a][1] == this.locations[1]){
          favorites[a][6] = "none";
        }else if(this.locations.length == 0 && favorites[a][2] == this.searchString){
          favorites[a][6] = "none";
        }
      }
      //console.log(favorites);

      this.storage.set('cityList', JSON.stringify(favorites));
      document.querySelector("#saveAsFavorites").style.display = "block";
      document.querySelector("#deleteFavorites").style.display = "none";
    });
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

  openMapDetailsPage(item) {
    this.nav.push(MapDetailsPage, { item: item });
  }

  openCityDetailsPage(item) {
    this.nav.push(CityDetailsPage, { item: item });
  }

}
