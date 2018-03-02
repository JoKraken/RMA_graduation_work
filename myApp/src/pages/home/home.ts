import { Component } from '@angular/core';
import { NavController, AlertController  } from 'ionic-angular';
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
    private alertCtrl: AlertController,
    private storage: Storage
  ) {
    this.storage.get('settings').then((val) => {
      this.settings = JSON.parse(val);
      if(this.settings == null){
        //console.log(this.settings);
        this.settings = {viewHistory: true, gps: null};
        let alert = this.alertCtrl.create({
          title: 'GPS-Zugriff',
          message: 'Darf Shorties auf deine GPS-Daten zugreifen?',
          buttons: [
            {
              text: 'Nein',
              role: 'Nein',
              handler: () => {
                this.settingsAlert(false);
              }
            },
            {
              text: 'Ja',
              handler: () => {
                this.settingsAlert(true);
              }
            }
          ]
        });
        alert.present();
      }

      if(this.settings.viewHistory){
        this.displayHelper("#mostWanted", "block");
        this.getViewHistory();
      }else{
        this.displayHelper("#mostWanted", "none");
      }
    });
  }

  settingsAlert(gps){
    this.settings = {gps: gps, viewHistory: true};
    console.log(this.settings);
    this.storage.set('settings', JSON.stringify(this.settings));
  }

  displayHelper(what, display){
    let elem = <HTMLElement>document.querySelector(what);
    elem.style.display = display;
  }

  ionViewWillEnter(){
    if(this.settings != null && this.settings.viewHistory) this.getViewHistory();
    this.getFavorites();
  }

  getViewHistory(){
    this.storage.get('cityList').then((val) => {
      this.viewHistory = JSON.parse(val);
      //console.log(this.viewHistory);
      if(this.viewHistory != null) this.displayHelper("#noHistory", "none");
      else this.displayHelper("#noHistory", "block");
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

      if(this.favorites != null && this.favorites.length != 0) this.displayHelper("#noFavorites", "none");
      else this.displayHelper("#noFavorites", "block");
    });
  }

  openSearchPage(item) {
    this.nav.push(AboutPage, { item: item });
  }

}
