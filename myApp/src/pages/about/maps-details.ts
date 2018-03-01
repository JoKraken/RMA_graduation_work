import { Component } from '@angular/core';
import { NavParams } from 'ionic-angular';


@Component({
  selector: 'maps-details',
  templateUrl: 'maps-details.html',
})

export class MapDetailsPage {
  item;
  steps;
  items = [];

  constructor(params: NavParams) {
    this.item = params;
    this.steps = params.data.item.steps;
    console.log(this.item);

    setTimeout(()=>{
        let string = document.querySelector("#instructions").innerHTML;
        for(let i = 0; i < this.steps.length; i++){
          string += "<button  style='background-color: #fff;width: 100%;padding: 16px;border-bottom: 1px solid #dedede'> "
            + this.steps[i].instructions + " (" +this.steps[i].distance.text +  ")</button > <br>";
        }
      document.querySelector("#instructions").innerHTML = string;
    }, this.steps, 100);

  }
}
