import { Component } from '@angular/core';
import { NavController } from 'ionic-angular';

import { Observable } from 'rxjs/Observable';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'page-about',
  templateUrl: 'about.html'
})
export class AboutPage {
  countSearch = 0;
  country = "";
  countryArray = [];
  searchString = "";
  weatherArray = [];
  request: Observable<any>;

  constructor(public navCtrl: NavController, public httpClient: HttpClient) {}

  search(ev: any){
    this.countSearch++;
    setTimeout(()=>{
      this.searchHelp(this.countSearch, ev);
    }, this.countSearch, ev, 3000);
  }

  searchHelp(param, ev: any){
    if(param == this.countSearch && document.querySelector(".country").style != undefined){
      this.countSearch = 0;
      document.querySelector(".country").style.display = "none";
      document.querySelector("#weather").style.visibility = "hidden";
      if(ev != undefined)this.searchString = ev.target.value;
      this.request = this.httpClient.get('http://api.wunderground.com/api/137581351957bfb1/forecast10day/q'+this.country+'/'+this.searchString+'.json');

      this.request
      .subscribe(data => {
        //console.log(data);
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

}
