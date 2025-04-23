import { Component } from '@angular/core';

@Component({
  selector: 'app-footer',
  standalone: false,
  templateUrl: './footer.component.html',
  styleUrl: './footer.component.css'
})
export class FooterComponent {
  anioActual: number = new Date().getFullYear();

  public adminLogueado: any = null;

  ngOnInit() {
    this.adminLogueado = localStorage.getItem("adminLogueado");
  }
}
