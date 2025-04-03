import { Component } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-perfil-participante',
  standalone: false,
  templateUrl: './perfil-participante.component.html',
  styleUrls: ['./perfil-participante.component.css']
})
export class PerfilParticipanteComponent {
  showModal = false;
  modalImageSrc = '';
  profileImage = '/assets/perfilDefecto.png';
  public participanteLogueado: any = null;
  
  editMode = false;

  constructor(private route: Router) { }

  ngOnInit() {
    const participanteLogueado = localStorage.getItem("participanteLogueado");

    if (participanteLogueado == null) {
      this.route.navigate(['/login-user']);
    } else {
      this.participanteLogueado = JSON.parse(participanteLogueado);
      console.log("participanteLogueado :>> ", this.participanteLogueado);
    }
  }

  userPhotos = [
    { url: '/assets/imagenPrincipal2.jpeg' }
  ];

  //Función para mostrar la imagen con Zoom
  openModal(imageSrc: string) {
    this.modalImageSrc = imageSrc;
    this.showModal = true;
    document.body.style.overflow = 'hidden';
  }

  //Función para cerrar la imagen con Zoom
  closeModal(event?: Event) {
    if (event) {
      event.stopPropagation();
    }
    this.showModal = false;
    document.body.style.overflow = '';
  }
}
