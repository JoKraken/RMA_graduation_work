import { Component, ViewChild,ElementRef } from '@angular/core';
import { NavController } from 'ionic-angular';
import { HttpClientModule } from '@angular/common/http';
import { HttpModule } from '@angular/http';

import { Observable } from 'rxjs/Observable';
import { HttpClient } from '@angular/common/http';
import { Geolocation } from '@ionic-native/geolocation';
import { NativeGeocoder, NativeGeocoderForwardResult } from '@ionic-native/native-geocoder';

declare var google: any;

@Component({
  selector: 'page-about',
  templateUrl: 'about.html'
})
export class AboutPage {
  @ViewChild('map') mapElement: ElementRef;
  map: any;
  geocoder;
  locations = [{lat: 52.272984, lng: 8.0460331}];
  directionsService = new google.maps.DirectionsService;
  directionsDisplay;

  countSearch = 0;
  country = "";
  countryArray = [];
  searchString = "";
  weatherArray = [];
  request: Observable<any>;

  constructor(
    private nativeGeocoder: NativeGeocoder,
    public navCtrl: NavController,
    public httpClient: HttpClient,
    private geolocation: Geolocation
  ) {}

  ionViewWillEnter(){
    this.loadMap();
  }

  search(ev: any){
    this.countSearch++;
    setTimeout(()=>{
      this.searchHelp(this.countSearch, ev);
    }, this.countSearch, ev, 3000);
  }

  searchHelp(param, ev: any){
    if(param == this.countSearch
      && document.querySelector(".country") != undefined
      && (document.querySelector(".country") as HTMLCollectionOf<HTMLElement>).style != undefined){

      this.countSearch = 0;
      document.querySelector(".country").style.display = "none";
      document.querySelector("#weather").style.visibility = "hidden";
      if(ev != undefined)this.searchString = ev.target.value;
      this.request = this.httpClient.get('http://api.wunderground.com/api/137581351957bfb1/forecast10day/q'+this.country+'/'+this.searchString+'.json');

      this.request
      .subscribe(data => {
        console.log(data);
        if(data.forecast != undefined){
          this.country = "";
          this.countryArray = [];
          let array = [];
          data.forecast.simpleforecast.forecastday.forEach(function(element) {
              // console.log(element);
              array.push(element);
          });
          this.weatherArray = array;
          document.querySelector("#weather").style.visibility = "visible";
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

  onclickCountry(){
    console.log("test");
    setTimeout(()=>{
      console.log("test2");
      document.getElementsByClassName("alert-button")[1].addEventListener("click", function(event){
        setTimeout(()=>{
          console.log("test3");
          this.search();
        }, 1000);
        });
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

      this.initializeRoute();
    }, (err) => {
      console.log(err);
    });
  }

  initializeRoute() {
    this.nativeGeocoder.forwardGeocode(this.searchString+", "+this.country)
    .then(function(coordinates: NativeGeocoderForwardResult) {
      console.log('The coordinates are latitude=' + coordinates.latitude + ' and longitude=' + coordinates.longitude)
    }).catch((error: any) => console.log(error+",error"));
    // map.addMarker({
    //   'position': position,
    //   'title':  JSON.stringify(result.position)
    // }, function(marker) {
    //
    // map.animateCamera({
    //   'target': position,
    //   'zoom': 17
    // }, function() {
    //
    // });
  }

}
