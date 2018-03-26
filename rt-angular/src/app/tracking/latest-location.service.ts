import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import 'rxjs/add/operator/map';
import {Observable} from 'rxjs/Observable';
import {TrackingData} from '../shared/models/trackingData';
import {environment} from '../../environments/environment';

declare var omnivore: any;
declare var L: any;

@Injectable()
export class LatestLocationService {
  apiAddress: string;
  apiToken: any;
  constructor(private http: HttpClient) {
    this.apiAddress = 'http://localhost:3000/test/getLastLocation?_id=5a99736c0af19f11a392b665'; //Change the url as required
    this.apiToken = environment.MAPBOX_API_KEY;
  }

  getLatestLocation(): Observable<Array<TrackingData>> {
    return this.http.get<Array<TrackingData>>(this.apiAddress);
  }

  plot(locationData: any): void {
    const myStyle = {
      'color': '#3949AB',
      'weight': 5,
      'opacity': 0.95
    };
    const map = L.map('map').setView([33.42192543, -111.92350757], 13);
    L.tileLayer('https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}', {
      attribution: 'Map data &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors,' +
      ' <a href="http://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, ' +
      'Imagery © <a href="http://mapbox.com">Mapbox</a>',
      maxZoom: 18,
      id: 'mapbox.streets',
      accessToken: this.apiToken
    }).addTo(map);

    for (const data of locationData) {
      const marker = L.marker([data.coordinates.lat, data.coordinates.lng], {title: 'Rider'}).addTo(map);
      marker.bindPopup('<b>Rider: </b><br>' + data.rider).openPopup();
    }
  }
}
