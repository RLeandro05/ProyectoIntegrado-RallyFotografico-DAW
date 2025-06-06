import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Participante } from '../modules/participante';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ServiceParticipanteService {
  public url: string = environment.API_URL;

  constructor(private http: HttpClient) { }

  listarParticipantes() {
    let cuerpo = {
      servicio: "listarParticipantes"
    };
    return this.http.post<Participante[]>(this.url, cuerpo);
  }

  registrarParticipante(participante: Participante) {
    let cuerpo = {
      servicio: "registrarParticipante",
      participante: participante
    };
    console.log("Cuerpo :>> ", cuerpo);

    return this.http.post<any>(this.url, cuerpo);
  }

  loguearParticipante(participante: Participante) {
    let cuerpo = {
      servicio: "loginParticipante",
      participante: participante
    };
    return this.http.post<Participante>(this.url, cuerpo);
  }

  modificarParticipante(participante: Participante) {
    let cuerpo = {
      servicio: "modificarParticipante",
      participante: participante
    };
    return this.http.post<any>(this.url, cuerpo);
  }

  obtenerIDParticipante(correo: string) {
    let cuerpo = {
      servicio: "obtenerIDParticipante",
      correo: correo
    };
    return this.http.post<number>(this.url, cuerpo);
  }

  obtenerParticipanteID(id: number) {
    let cuerpo = {
      servicio: "obtenerParticipanteID",
      id: id
    };
    return this.http.post<Participante>(this.url, cuerpo);
  }

  eliminarParticipante(idParticipante: number) {
    let cuerpo = {
      servicio: "eliminarParticipante",
      idParticipante: idParticipante
    };
    return this.http.post<any>(this.url, cuerpo);
  }
}
