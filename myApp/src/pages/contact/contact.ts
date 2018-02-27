import { Component } from '@angular/core';
import { NavController } from 'ionic-angular';
import { Storage } from '@ionic/storage';


@Component({
  selector: 'page-contact',
  templateUrl: 'contact.html'
})
export class ContactPage {
  gps;
  viewHistory;

  constructor(
    public navCtrl: NavController,
    private storage: Storage
  ) {

  }

  ionViewWillEnter(){
    this.storage.get('settings').then((val) => {
      let settings = JSON.parse(val);
      console.log(settings);
      this.gps = settings.gps;
      this.viewHistory = settings.viewHistory;
    });
  }

  ionViewWillLeave(){
    console.log("test");
    let settings = {gps: this.gps, viewHistory: this.viewHistory};
    this.storage.set('settings', JSON.stringify(settings));
  }

}
