import { Component } from '@angular/core';
import { NavController } from 'ionic-angular';

import { Observable } from 'rxjs/Observable';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'page-about',
  templateUrl: 'about.html'
})
export class AboutPage {
  searchString = "";
  weatherArray = [];
  // weather = [];
  request: Observable<any>;

  constructor(public navCtrl: NavController, public httpClient: HttpClient) {}

  search(){
    if(document.querySelector("#searchButton").style.backgroundColor == ""){
      document.querySelector("#weather").style.visibility = "hidden";
      document.querySelector("#searchButton").style.backgroundColor = "#f4f4f4";
      this.request = this.httpClient.get('http://api.wunderground.com/api/137581351957bfb1/forecast10day/q/CA/'+this.searchString+'.json');

      this.request
      .subscribe(data => {
        let array = [];
        data.forecast.simpleforecast.forecastday.forEach(function(element) {
            console.log(element);
            array.push(element);
        });
        this.weatherArray = array;
        //this.weather = array;
        document.querySelector("#weather").style.visibility = "visible";
        document.querySelector("#searchButton").style.backgroundColor = "";
       })
    }
  }

}
