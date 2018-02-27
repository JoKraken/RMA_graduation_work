import { Component } from '@angular/core';
import { NavController } from 'ionic-angular';
import { Storage } from '@ionic/storage';

@Component({
  selector: 'page-home',
  templateUrl: 'home.html'
})
export class HomePage {

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
    });
  }

}
