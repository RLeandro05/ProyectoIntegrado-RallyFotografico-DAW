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
}
