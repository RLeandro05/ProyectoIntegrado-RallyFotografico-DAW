import { Component } from '@angular/core';

@Component({
  selector: 'app-header',
  standalone: false,
  templateUrl: './header.component.html',
  styleUrl: './header.component.css'
})
export class HeaderComponent {
  public isMenuOpen: boolean = false;
  public isLoged: boolean = false;
  public participanteLogueado: any = null;

  constructor() {
    // Intentar obtener el participante logueado del localStorage
    let participanteLogueado = localStorage.getItem("participanteLogueado");

    if (participanteLogueado != null) {
      // Parsear el JSON para obtener el objeto participante
      this.participanteLogueado = JSON.parse(participanteLogueado);
      this.isLoged = true;
    } else {
      this.isLoged = false;
    }
  }

  toggleMenu(): void {
    this.isMenuOpen = !this.isMenuOpen;
  }
}
