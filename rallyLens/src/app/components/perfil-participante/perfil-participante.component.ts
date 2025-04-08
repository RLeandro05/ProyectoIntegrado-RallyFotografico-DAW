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

      if (this.participanteLogueado.foto_perfil) {
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

  //Función para realizar la modificación completa de las credenciales
  onSubmit() {
    //Confirmar que es válido el formulario
    if (this.perfilForm.valid) {
      //Crear un el participante actualizado a partir del ya modificado en el formulario
      const participanteActualizado = {
        ...this.perfilForm.value,
        //La foto de perfil será el de la seleccionada (si se escogió alguna), o la que tiene ya por defecto puesta
        foto_perfil: this.selectedImage ? this.selectedImage.toString() : this.participanteLogueado.foto_perfil,
        id: this.participanteLogueado.id
      };

      //Llamar a la función para modificar el participante recién creado para actualizarlo
      this.serviceParticipante.modificarParticipante(participanteActualizado).subscribe(
        respuesta => {
          //Si todo está en orden y se actualizó correctamente, llamar a la función para obtener el id del participante actual a modificar
          if (respuesta.success) {
            this.serviceParticipante.obtenerParticipanteID(this.participanteLogueado.id).subscribe(
              datosActualizados => {
                //Actualizar el localStorage del participante modificado
                localStorage.setItem("participanteLogueado", JSON.stringify(datosActualizados));
                this.participanteLogueado = datosActualizados; //Sobreescribir datos
                this.editMode = false;
              }
            );

            alert(respuesta.message);
          }
          //Si no se actualiza correctamente, probar entre las diversas opciones sobre el por qué, para darle mayor interactividad al usuario 
          else {
            const mensaje = 
            respuesta.faltaParticipante || respuesta.noEncuentra ||
            respuesta.correoExiste || respuesta.noCambia || null;

            mensaje ? alert(mensaje) : console.log(respuesta.error);
          }
        }
      );
    }
  }
}
