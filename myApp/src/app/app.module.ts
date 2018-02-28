import { NgModule, ErrorHandler } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { IonicApp, IonicModule, IonicErrorHandler } from 'ionic-angular';
import { IonicStorageModule } from '@ionic/storage';
import { MyApp } from './app.component';


import { AboutPage } from '../pages/about/about';
import { MapDetailsPage } from '../pages/about/maps-details';
import { CityDetailsPage } from '../pages/about/city-details';
import { ContactPage } from '../pages/contact/contact';
import { HomePage } from '../pages/home/home';
import { TabsPage } from '../pages/tabs/tabs';

import { StatusBar } from '@ionic-native/status-bar';
import { SplashScreen } from '@ionic-native/splash-screen';

import { HttpClientModule } from '@angular/common/http';
import { HttpModule } from '@angular/http';
import { Geolocation } from '@ionic-native/geolocation';
import { NativeGeocoder } from '@ionic-native/native-geocoder';

@NgModule({
  declarations: [
    MyApp,
    AboutPage,
    MapDetailsPage,
    CityDetailsPage,
    ContactPage,
    HomePage,
    TabsPage
  ],
  imports: [
    BrowserModule,
    HttpModule,
    HttpClientModule,
    IonicModule.forRoot(MyApp,
    {
       links: [
          // { component: CityDetailsPage, name: 'CityDetailsPage', segment: 'city-details' },
          // { component: MapDetailsPage, name: 'MapDetailsPage', segment: 'maps-details' },
          // { component: AboutPage, name: 'AboutPage', segment: 'page-about' }
       ]
    }),
    IonicStorageModule.forRoot()
  ],
  bootstrap: [IonicApp],
  entryComponents: [
    MyApp,
    AboutPage,
    MapDetailsPage,
    CityDetailsPage,
    ContactPage,
    HomePage,
    TabsPage
  ],
  providers: [
    StatusBar,
    SplashScreen,
    Geolocation,
    NativeGeocoder,
    {provide: ErrorHandler, useClass: IonicErrorHandler}
  ]
})
export class AppModule {}
