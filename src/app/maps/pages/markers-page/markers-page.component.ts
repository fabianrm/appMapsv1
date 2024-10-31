import { Component, ElementRef, ViewChild } from '@angular/core';
import { LngLat, Map, Marker } from 'mapbox-gl';

interface MarkerAndColor {
  color: string;
  marker: Marker;
}

interface PlainMarker {
  color: string;
  lngLat: number[] // lngLat: [number, number];
}

@Component({
  templateUrl: './markers-page.component.html',
  styleUrl: './markers-page.component.css'
})
export class MarkersPageComponent {
  @ViewChild('map') divMap?: ElementRef;

  zoom: number = 13;
  map?: Map;
  currentLngLat: LngLat = new LngLat(-77.038, -12.050);
  markers: MarkerAndColor[] = [];

  ngAfterViewInit(): void {

    if (!this.divMap) throw 'El elemento HTML no fue encontrado';

    this.map = new Map({
      container: this.divMap?.nativeElement, // container ID
      style: 'mapbox://styles/mapbox/streets-v12', // style URL
      center: this.currentLngLat, // starting position [lng, lat]
      zoom: this.zoom, // starting zoom
    });

    this.readFromLocalStorage()
    // const marker = new Marker({
    //   color: 'red',
    // })
    //   .setLngLat(this.currentLngLat)
    //   .addTo(this.map);
  }



  ngOnDestroy(): void {
    this.map?.remove();
  }


  createMarker() {
    if (!this.map) return;
    const color = '#xxxxxx'.replace(/x/g, y => (Math.random() * 16 | 0).toString(16));
    const lngLat = this.map.getCenter();
    this.addMarker(lngLat, color);
  }


  addMarker(lngLat: LngLat, color: string) {
    if (!this.map) return;

    const marker = new Marker({
      color: color,
      draggable: true,
    }).setLngLat(lngLat)
      .addTo(this.map);

    this.markers.push({
      color: color,
      marker: marker,
    });


    marker.on('dragend', () => {
      this.saveLocalStorage()
    })


  }


  deleteMarker(index: number) {
    this.markers[index].marker.remove();
    this.markers.splice(index, 1);
  }

  flyTo(marker: Marker) {
    this.map?.flyTo({
      zoom: 14,
      center: marker.getLngLat()
    });
  }


  saveLocalStorage() {
    // const plainMarkers: PlainMarker[] = this.markers.map((markers) => {
    //   return {
    //     color: markers.color,
    //     lngLat: markers.marker.getLngLat().toArray()
    //   }
    // });

    //Desestructurando
    const plainMarkers: PlainMarker[] = this.markers.map(({ color, marker }) => {
      return {
        color: color,
        lngLat: marker.getLngLat().toArray()
      }
    });
   localStorage.setItem('plainMarkers', JSON.stringify(plainMarkers));
    
  }

  readFromLocalStorage() {

    const planinMarkersString = localStorage.getItem('plainMarkers') ?? '[]';
    const plainMarkers: PlainMarker[] = JSON.parse(planinMarkersString); //!ojo

    plainMarkers.forEach(({ color, lngLat }) => {
      const [lng, lat] = lngLat;
      const coords = new LngLat(lng, lat);
      this.addMarker(coords, color)
    })
    
    
   }


}
