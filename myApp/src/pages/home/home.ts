import { Component } from '@angular/core';
import { NavController } from 'ionic-angular';
import { Storage } from '@ionic/storage';

import { AboutPage  } from '../about/about';

@Component({
  selector: 'page-home',
  templateUrl: 'home.html'
})
export class HomePage {
  viewHistory;
  favorites;
  cityList;
  settings;

  constructor(
    public nav: NavController,
    private storage: Storage
  ) {
    this.storage.get('settings').then((val) => {
      this.settings = JSON.parse(val);
      if(this.settings == null){
        //console.log(settings);
        this.settings = {gps: true, viewHistory: true};

        this.storage.set('settings', JSON.stringify(this.settings));
      }

      if(this.settings.viewHistory){
        document.querySelector("#mostWanted").style.display = "block";
        this.getViewHistory();
      }else{
        document.querySelector("#mostWanted").style.display = "none";
      }
    });
  }

  ionViewWillEnter(){
    if(this.settings != null && this.settings.viewHistory) this.getViewHistory();
    this.getFavorites();
  }

  getViewHistory(){
    this.storage.get('cityList').then((val) => {
      this.viewHistory = JSON.parse(val);
      //console.log(this.viewHistory);
      if(this.viewHistory != null) document.querySelector("#noHistory").style.display = "none";
      else document.querySelector("#noHistory").style.display = "block";
    });
  }

  getFavorites(){
    this.storage.get('cityList').then((val) => {
      this.cityList = JSON.parse(val);
      this.favorites = [];
      if(this.cityList != null){
        for(let i = 0; i < this.cityList.length; i++){
          if(this.cityList[i][6] == "block"){
            this.favorites.push(this.cityList[i]);
          }
        }
      }
      console.log(this.favorites);
      if(this.favorites != null && this.favorites.length != 0) document.querySelector("#noFavorites").style.display = "none";
      else document.querySelector("#noFavorites").style.display = "block";
    });
  }

  openSearchPage(item) {
    this.nav.push(AboutPage, { item: item });
  }

}
