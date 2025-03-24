import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment.development';
import { Foto } from '../modules/foto';

@Injectable({
  providedIn: 'root'
})
export class ServiceFotoService {
  public url: string = environment.API_URL;

  constructor(private http: HttpClient) {}

  listarFotos() {
    let cuerpo = {
      servicio: "listarFotos"
    };
    return this.http.post<Foto>(this.url, cuerpo);
  }
}
