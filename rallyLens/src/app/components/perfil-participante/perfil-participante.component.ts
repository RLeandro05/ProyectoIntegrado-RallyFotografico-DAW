import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { FormBuilder, FormGroup } from '@angular/forms';
import { ServiceParticipanteService } from '../../services/service-participante.service';
import { Foto } from '../../modules/foto';
import { ServiceFotoService } from '../../services/service-foto.service';

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

  selectedImage: string | ArrayBuffer | null = null;
  showPhotoForm = false;
  newPhotoPreview: string | ArrayBuffer | null = null;

  public participanteLogueado: any = null;
  userPhotos: any[] = [];
  maxPhotos = 3;

  public foto: Foto = <Foto>{};

  constructor(private route: Router, private fb: FormBuilder, private serviceParticipante: ServiceParticipanteService, private serviceFoto: ServiceFotoService) { }

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

      this.loadUserPhotos();
    }
  }

  //Función para listar todas las fotos subidas por el participante
  loadUserPhotos() {
    this.serviceFoto.listarFotosParticipante(this.participanteLogueado.id).subscribe(
      datos => {
        this.userPhotos = datos;

        console.log("Listado de fotos del participante :>> ", this.userPhotos);
      },
      error => {
        console.error('Error al cargar fotos:', error);
        this.userPhotos = [];
      }
    );
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
        foto_perfil: [null]
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

  //Función para abrir o cerrar el formulario de la foto a subir
  togglePhotoForm() {
    if (this.userPhotos.length >= this.maxPhotos) return;
    this.showPhotoForm = !this.showPhotoForm;
    //Si no se muestra el formulario, poner la preview como nula para no mostrar nada estando cerrado
    if (!this.showPhotoForm) {
      this.newPhotoPreview = null;
    }
  }

  //Función para que, al igual que con la foto de perfil, muestre una preview de la foto
  onPhotoSelect(event: any) {
    console.log("Entra en onPhotoSelect");

    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        this.newPhotoPreview = reader.result;
      };
      reader.readAsDataURL(file);
    }
  }

  //Función para que, al pinchar en Cancelar, cierre el formulario y ponga la preview como nula
  cancelPhotoUpload() {
    this.showPhotoForm = false;
    this.newPhotoPreview = null;
  }

  //Función para cargar o subir la foto
  uploadPhoto(event: any) {
    event.preventDefault();
    if (!this.newPhotoPreview) return;

    this.foto = {
      id: -1,
      id_participante: this.participanteLogueado.id,
      imagen: this.newPhotoPreview.toString(),
      estado: "pendiente",
      votos: 0,
      fec_mod: null
    };

    console.log("Foto a subir :>> ", this.foto);


    this.serviceFoto.subirFoto(this.foto).subscribe(
      response => {
        if (response) {
          this.loadUserPhotos();
          this.showPhotoForm = false;
          this.newPhotoPreview = null;
          alert('Foto subida correctamente');
        } else {
          alert('Error al subir la foto');
        }
      },
      error => {
        console.error('Error:', error);
        alert('Error al subir la foto');
      }
    );
  }

  //Función para borrar una foto seleccionada
  borrarFoto(idFoto: number) {
    console.log("idFoto :>> ", idFoto);

    if (confirm("¿Estás seguro de que quieres eliminar la foto? Perderá todos sus votos en el registro.")) {
      this.serviceFoto.borrarFoto(idFoto).subscribe(
        resultado => {
          if (resultado["fotoBorrada"]) {
            console.log("resultado :>> ", resultado);

            alert(resultado["fotoBorrada"]);

            //Si se ha borrado correctamente, volver a listar la lista de fotos actualizada
            this.serviceFoto.listarFotosParticipante(this.participanteLogueado.id).subscribe(
              datos => {
                this.userPhotos = datos;

                console.log("Listado de fotos del participante :>> ", this.userPhotos);
              },
              error => {
                console.error('Error al cargar fotos:', error);
                this.userPhotos = [];
              }
            )
          }

        }, error => console.error("Error al eliminar la foto de la galería del participante :>> ", error)
      )
    }
  }
}
