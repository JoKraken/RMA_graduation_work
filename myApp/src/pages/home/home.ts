import { Component } from '@angular/core';
import { NavController } from 'ionic-angular';
import { Storage } from '@ionic/storage';

@Component({
  selector: 'page-home',
  templateUrl: 'home.html'
})
export class HomePage {
  viewHistory;
  favorites;

  constructor(
    public navCtrl: NavController,
    private storage: Storage
  ) {
    this.storage.get('settings').then((val) => {
    let settings = JSON.parse(val);
      if(settings == null){
        console.log(settings);
        settings = {gps: true, viewHistory: true};

        this.storage.set('settings', JSON.stringify(settings));
      }
      this.getViewHistory(settings);
    });
  }

  ionViewWillEnter(){
    this.storage.get('settings').then((val) => {
      let settings = JSON.parse(val);
      this.getViewHistory(settings);
      this.getFavorites();
    });
  }

  getViewHistory(settings){
    if(settings != null && settings.viewHistory){
      document.querySelector("#mostWanted").style.display = "block";
      this.storage.get('viewHistory').then((val) => {
        this.viewHistory = JSON.parse(val);
        if(this.viewHistory != null) document.querySelector("#noHistory").style.display = "none";
        else document.querySelector("#noHistory").style.display = "block";
      });
    }else{
      document.querySelector("#mostWanted").style.display = "none";
    }
  }

  getFavorites(){
    this.storage.get('favorites').then((val) => {
      this.favorites = JSON.parse(val);
      console.log(this.favorites.length);
      if(this.favorites != null && this.favorites.length != 0) document.querySelector("#noFavorites").style.display = "none";
      else document.querySelector("#noFavorites").style.display = "block";
    });
  }

}
