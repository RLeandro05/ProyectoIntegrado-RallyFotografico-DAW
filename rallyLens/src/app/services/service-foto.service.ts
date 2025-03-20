import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment.development';

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
    return this.http.post<any>(this.url, cuerpo);
  }
}
