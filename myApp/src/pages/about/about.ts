import { Component } from '@angular/core';
import { NavController } from 'ionic-angular';

import { Observable } from 'rxjs/Observable';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'page-about',
  templateUrl: 'about.html'
})
export class AboutPage {
  weather = {
    "icon" : "",
    "nowTemp" : "",
    "relative_humidity" : ""
  };
  searchString = "";
  request: Observable<any>;

  constructor(public navCtrl: NavController, public httpClient: HttpClient) {}

  search(){
    if(document.querySelector("#searchButton").style.backgroundColor == ""){
      document.querySelector("#weather").style.visibility = "hidden";
      document.querySelector("#searchButton").style.backgroundColor = "#f4f4f4";
      console.log(this.searchString);
      this.request = this.httpClient.get('http://api.wunderground.com/api/137581351957bfb1/conditions/q/CA/'+this.searchString+'.json');
      this.request
      .subscribe(data => {
        document.querySelector("#weather").style.visibility = "visible";
        console.log('my data: ', data.current_observation);
        this.weather.alreadySearch = true;
        this.weather.icon = data.current_observation.icon_url;
        this.weather.nowTemp = data.current_observation.temp_c;
        document.querySelector("#searchButton").style.backgroundColor = "";
      })
    }
  }

}
