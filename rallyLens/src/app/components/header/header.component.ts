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
  public adminLogueado: any = null;

  constructor(private route: Router) {
  }

  ngOnInit() {
    setTimeout(() => {
      const participanteGuardado = localStorage.getItem("participanteLogueado");
      
      if (participanteGuardado) {
        this.participanteLogueado = JSON.parse(participanteGuardado);
        this.isLoged = true;
        //console.log("Usuario logueado:", this.participanteLogueado);
      } else {
        const adminGuardado = localStorage.getItem("adminLogueado");
        if (adminGuardado) {
          this.adminLogueado = JSON.parse(adminGuardado);
          this.isLoged = true;
        } else {
          this.isLoged = false;
        }
      }
    }, 500); // Pequeño retraso para sincronización
  }

  toggleMenu(): void {
    this.isMenuOpen = !this.isMenuOpen;
  }

  logout() {
    localStorage.removeItem("participanteLogueado");
    this.participanteLogueado = null;

    localStorage.removeItem("adminLogueado");
    this.adminLogueado = null;

    this.isLoged = false;
    this.route.navigate(['/']);

    setTimeout(() => alert("Has cerrado sesión exitosamente."), 800);
  }
}
