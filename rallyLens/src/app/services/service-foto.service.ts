import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Foto } from '../modules/foto';
import { environment } from '../../environments/environment';

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
    return this.http.post<Foto[]>(this.url, cuerpo);
  }

  listarFotosParticipante(idParticipante: number) {
    let cuerpo = {
      servicio: "listarFotosParticipante",
      id: idParticipante
    };
    return this.http.post<any>(this.url, cuerpo);
  }

  subirFoto(foto: Foto) {
    let cuerpo = {
      servicio: "subirFoto",
      foto: foto
    };
    return this.http.post<any>(this.url, cuerpo);
  }

  borrarFoto(idFoto: number) {
    let cuerpo = {
      servicio: "borrarFotoParticipante",
      idFoto: idFoto
    };
    return this.http.post<any>(this.url, cuerpo);
  }

  editarFoto(foto: Foto) {
    let cuerpo = {
      servicio: "editarFotoParticipante",
      foto: foto
    };
    return this.http.post<any>(this.url, cuerpo);
  }

  cambiarEstado(foto: Foto) {
    let cuerpo = {
      servicio: "cambiarEstadoFotografia",
      foto: foto
    };
    return this.http.post<any>(this.url, cuerpo);
  }

  alternarVoto(idFoto: number, idParticipante: number, idParticipanteVotado: number) {
    let cuerpo = {
      servicio: "alternarVoto",
      idFoto: idFoto,
      idParticipante: idParticipante,
      idParticipanteVotado: idParticipanteVotado
    };
    return this.http.post<any>(this.url, cuerpo);
  }

  obtenerFotografiaID(idFoto: number) {
    let cuerpo = {
      servicio: "obtenerFotografiaID",
      idFoto: idFoto
    };
    return this.http.post<Foto>(this.url, cuerpo);
  }
}
