import { Component } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-perfil-participante',
  standalone: false,
  templateUrl: './perfil-participante.component.html',
  styleUrl: './perfil-participante.component.css'
})
export class PerfilParticipanteComponent {
  showModal = false;
  modalImageSrc = '';
  profileImage = '/assets/imagenPrincipal2.jpeg';

  constructor(private route: Router) { }

  ngOnInit() {
    const participanteLogueado = localStorage.getItem("participanteLogueado");
    if (participanteLogueado == null) {
      this.route.navigate(['/login-user']);
    }
  }

  userPhotos = [
    { url: '/assets/imagenPrincipal2.jpeg' }
    // Agrega más fotos si es necesario
  ];

  openModal(imageSrc: string) {
    this.modalImageSrc = imageSrc;
    this.showModal = true;
    document.body.style.overflow = 'hidden'; // Deshabilita el scroll
  }

  closeModal(event?: Event) {
    if (event) {
      event.stopPropagation(); // Evita que el click se propague al modal
    }
    this.showModal = false;
    document.body.style.overflow = ''; // Habilita el scroll nuevamente
  }
}
