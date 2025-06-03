import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Voto } from '../modules/voto';
import { environment } from '../../environments/environment';

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

  borrarVotosIDs(idFoto: number, idParticipante: number) {
    let cuerpo = {
      servicio: "borrarVotosIDs",
      idFoto: idFoto,
      idParticipante: idParticipante
    };
    return this.http.post<any>(this.url, cuerpo);
  }
  
}
