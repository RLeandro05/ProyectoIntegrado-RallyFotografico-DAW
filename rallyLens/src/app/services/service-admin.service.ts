import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Admin } from '../modules/admin';
import { environment } from '../../environments/environment';

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

  loginAdmin(admin: Admin) {
    let cuerpo = {
      servicio: "loginAdmin",
      admin: admin
    };
    return this.http.post<Admin>(this.url, cuerpo);
  }
}
