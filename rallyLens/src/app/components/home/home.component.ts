import { Component } from '@angular/core';
import { Participante } from '../../modules/participante';

@Component({
  selector: 'app-home',
  standalone: false,
  templateUrl: './home.component.html',
  styleUrl: './home.component.css'
})
export class HomeComponent {

  public adminLogueado: any;

  public isAdminLoged: boolean = false;

  ngOnInit() {
    this.adminLogueado = localStorage.getItem("adminLogueado");

    if(this.adminLogueado) this.isAdminLoged = !this.isAdminLoged;

    //console.log(this.isAdminLoged);
  }
}
