import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { FormBuilder, FormGroup } from '@angular/forms';
import { ServiceParticipanteService } from '../../services/service-participante.service';

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

  constructor(private route: Router, private fb: FormBuilder, private serviceParticipante: ServiceParticipanteService) { }

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
        foto_perfil: [this.participanteLogueado.foto_perfil]
      });

      if(this.participanteLogueado.foto_perfil) {
        this.profileImage = this.participanteLogueado.foto_perfil;
      }
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

    if (this.editMode) {
      this.perfilForm = this.fb.group({
        nombre: [this.participanteLogueado.nombre],
        apellidos: [this.participanteLogueado.apellidos],
        correo: [this.participanteLogueado.correo],
        telefono: [this.participanteLogueado.telefono],
        foto_perfil: [null] // Campo para la foto de perfil
      });

      this.selectedImage = null;
    }

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

  //Función para guardar cambios al enviar el formulario
  onSubmit() {
    if (this.perfilForm.valid) {
      this.participanteLogueado = { ...this.perfilForm.value };

      //Obtener el id del participante
      this.serviceParticipante.obtenerIDParticipante(this.participanteLogueado.correo).subscribe(
        idObtenido => {
          const idParticipante = idObtenido;

          //Participante completo
          const participanteCompleto = {
            ...this.perfilForm.value,
            foto_perfil: this.selectedImage ? this.selectedImage.toString() : null,
            id: idParticipante
          };

          //Modificar los campos del participante
          this.serviceParticipante.modificarParticipante(participanteCompleto).subscribe(
            confirmacion => {
              if(confirmacion["success"]) {
                console.log("Entra en true");
                
                //Obtener el nuevo participante actualizado para mostrar en localStorage
                this.serviceParticipante.obtenerParticipanteID(participanteCompleto.id).subscribe(
                  datos => {
                    console.log("Participante sacado a través de su id :>> ", datos);

                    localStorage.setItem("participanteLogueado", JSON.stringify(datos));
                  }, error => console.error("Error al sacar el participante a través de su id :>> ", error)
                )
                


                localStorage.setItem("participanteLogueado", JSON.stringify(participanteCompleto));
              } else {
                console.log("Entra en false");
              }
              console.log("Confirmación de Modificación :>> ", confirmacion);
            }, error => console.error("Error al modificar el participante :>> ", error)
          )
        }, error => console.error("Error al obtener el id del participante :>> ", error)
      )

      this.editMode = false; //Salir del modo edición
    }
  }
}
