import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment.development';
import { Voto } from '../modules/voto';

@Injectable({
  providedIn: 'root'
})
export class ServiceVotoService {
  public url: string = environment.API_URL;

  constructor(private http: HttpClient) {}

  obtenerVotosParticipante(idParticipante: number) {
    let cuerpo = {
      servicio: "obtenerVotosParticipante",
      idParticipante: idParticipante
    };
    return this.http.post<Voto[]>(this.url, cuerpo);
  }
}
