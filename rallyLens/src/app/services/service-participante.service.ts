import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment.development';
import { Participante } from '../modules/participante';

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
    return this.http.post<Participante>(this.url, cuerpo);
  }

  registrarParticipante(participante: Participante) {
    let cuerpo = {
      servicio: "registrarParticipante",
      participante: participante
    };
    console.log("Cuerpo :>> ", cuerpo);
    
    return this.http.post<Participante>(this.url, cuerpo);
  }
}
