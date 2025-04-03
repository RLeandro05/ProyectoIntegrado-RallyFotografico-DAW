import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { FormBuilder, FormGroup } from '@angular/forms';

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
  editMode = false;
  perfilForm!: FormGroup;
  
  selectedImage: string | ArrayBuffer | null = null; //Para vista previa de la imagen

  public participanteLogueado: any = null;
  userPhotos = [
    { url: "/assets/imagenPrincipal1.jpeg" }
  ];

  constructor(private route: Router, private fb: FormBuilder) {}

  ngOnInit() {
    const participanteLogueado = localStorage.getItem("participanteLogueado");

    if (!participanteLogueado) {
      this.route.navigate(['/login-user']);
    } else {
      this.participanteLogueado = JSON.parse(participanteLogueado);
      this.perfilForm = this.fb.group({
        nombre: [this.participanteLogueado.nombre],
        apellidos: [this.participanteLogueado.apellidos],
        correo: [this.participanteLogueado.correo],
        telefono: [this.participanteLogueado.telefono],
        foto_perfil: [null] // Campo para la foto de perfil
      });
    }
  }

  //Función para abrir el modal de la foto
  openModal(imageSrc: string) {
    this.modalImageSrc = imageSrc;
    this.showModal = true;
    document.body.style.overflow = 'hidden';
  }

  //Función para cerrar el modal
  closeModal(event?: Event) {
    if (event) event.stopPropagation();
    this.showModal = false;
    document.body.style.overflow = '';
  }

  //Función para activar/desactivar el modo edición
  toggleEditMode() {
    this.editMode = !this.editMode;
  }

  //Función para manejar la imagen seleccionada
  onFileSelect(event: any) {
    //Guardar el archivo traído
    const file = event.target.files[0];

    //Si existe, ejecutar la funcion para convertirlo en base64
    if (file) {
      this.convertToBase64(file);
    }
  }

  //Función para convertirlo en base64
  convertToBase64(file: File) {
    //Crear un nuevo FilerReader
    const reader = new FileReader();

    //Al ser leído, mostrar una vista previa de la imagen seleccionada y luego almacenarlo como Blob
    reader.onload = () => {
      this.selectedImage = reader.result;

      this.perfilForm.patchValue({
        foto_perfil: file
      });
    };
    reader.readAsDataURL(file); //Convertir el archivo a Base64
  }

  // Función para guardar cambios al enviar el formulario
  onSubmit() {
    if (this.perfilForm.valid) {
      // Aquí podemos hacer lo que necesitemos con el Blob, por ejemplo,
      // enviarlo al backend, o guardarlo localmente.
      console.log('Participante actualizado:', this.perfilForm.value);
      this.participanteLogueado = { ...this.perfilForm.value };
      this.editMode = false; // Salir del modo edición
    }
  }
}
