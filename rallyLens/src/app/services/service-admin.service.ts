import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment.development';
import { Admin } from '../modules/admin';

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
    return this.http.post<Admin>(this.url, cuerpo);
  }
}
