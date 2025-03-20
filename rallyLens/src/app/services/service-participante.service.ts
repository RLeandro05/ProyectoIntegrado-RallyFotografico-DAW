import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment.development';

@Injectable({
  providedIn: 'root'
})
export class ServiceParticipanteService {
  public url: string = environment.API_URL;

  constructor(private http: HttpClient) {}

  listarParticipantes() {
    let cuerpo = {
      servicio: "listarParticipantes"
    };
    return this.http.post<any>(this.url, cuerpo);
  }
}
