import { Component, ViewChild, ElementRef } from '@angular/core';
import { NavController, NavParams } from 'ionic-angular';
import { Storage } from '@ionic/storage';

import { Observable } from 'rxjs/Observable';
import { HttpClient } from '@angular/common/http';
import { Geolocation } from '@ionic-native/geolocation';


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
          title: this.itemsMap[i].name,
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
