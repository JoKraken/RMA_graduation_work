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
      this.gps = settings.gps;
      this.viewHistory = settings.viewHistory;
    });
  }

  ionViewWillLeave(){}

  onclickSettings(art){
    let settings;
    console.log(art);
    if(art == 0) settings = {gps: this.gps, viewHistory: this.viewHistory};
    else settings = {gps: this.gps, viewHistory: this.viewHistory};
    console.log(settings);
    this.storage.set('settings', JSON.stringify(settings));
  }

}
