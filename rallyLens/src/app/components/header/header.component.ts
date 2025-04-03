import { Component } from '@angular/core';
import { Router } from '@angular/router';

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

  constructor(private route: Router) {
  }

  ngOnInit() {
    setTimeout(() => {
      const participanteGuardado = localStorage.getItem("participanteLogueado");
      
      if (participanteGuardado) {
        this.participanteLogueado = JSON.parse(participanteGuardado);
        this.isLoged = true;
        console.log("Usuario logueado:", this.participanteLogueado);
      } else {
        this.isLoged = false;
      }
    }, 500); // Pequeño retraso para sincronización
  }

  toggleMenu(): void {
    this.isMenuOpen = !this.isMenuOpen;
  }

  logout() {
    localStorage.removeItem("participanteLogueado");
    this.isLoged = false;
    this.participanteLogueado = null;
    this.route.navigate(['/']);
  }
}
