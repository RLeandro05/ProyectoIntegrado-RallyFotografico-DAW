import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment.development';

@Injectable({
  providedIn: 'root'
})
export class ServiceAdminService {
  public url: string = environment.API_URL;

  constructor(private http: HttpClient) {}

  listarAdmins() {
    let cuerpo = {
      servicio: "listarAdmins"
    };
    return this.http.post<any>(this.url, cuerpo);
  }
}
