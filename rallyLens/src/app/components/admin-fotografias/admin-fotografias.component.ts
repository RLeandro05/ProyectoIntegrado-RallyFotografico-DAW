import { Component } from '@angular/core';
import { Foto } from '../../modules/foto';
import { Participante } from '../../modules/participante';
import { ServiceFotoService } from '../../services/service-foto.service';
import { ServiceParticipanteService } from '../../services/service-participante.service';
import { ServiceVotoService } from '../../services/service-voto.service';

@Component({
  selector: 'app-admin-fotografias',
  standalone: false,
  templateUrl: './admin-fotografias.component.html',
  styleUrl: './admin-fotografias.component.css'
})
export class AdminFotografiasComponent {

  cargando: boolean = true;

  fotos: Foto[] = [];
  fotosPagina: Foto[] = [];
  participantes: Participante[] = [];
  numVotos: number = 0;
  numParticipantes: number = 0;

  paginaActual: number = 1;
  fotosPorPagina: number = 10;

  filtroEstado: string = 'todas';

  showModal = false;
  modalImageSrc = '';

  constructor(
    private serviceFotos: ServiceFotoService,
    private serviceParticipantes: ServiceParticipanteService,
    private serviceVotos: ServiceVotoService
  ) { }

  ngOnInit() {
    console.log("Entra en admin-fotografias");

    this.listarParticipantes();
  }

  listarFotos() {
    this.serviceFotos.listarFotos().subscribe(
      datos => {
        if (datos) {
          this.fotos = datos;
          console.log("Fotos :>> ", this.fotos);

          this.numVotos = 0;
          this.fotos.forEach(foto => this.numVotos += foto.votos);

          switch (this.filtroEstado) {
            case "pendiente":
              this.fotos = this.fotos.filter(foto => foto.estado === "pendiente");
              break;
            case "aceptada":
              this.fotos = this.fotos.filter(foto => foto.estado === "aceptada");
              break;
            case "rechazada":
              this.fotos = this.fotos.filter(foto => foto.estado === "rechazada");
              break;
          }

          this.actualizarFotosPagina();
          this.cargando = false;
        }
      },
      error => console.error("Error al listar las fotos:", error)
    );
  }

  listarParticipantes() {
    this.cargando = true;
    this.serviceParticipantes.listarParticipantes().subscribe(
      datos => {
        if (datos) {
          this.participantes = datos;
          this.numParticipantes = datos.length;

          this.listarFotos();
        }
      },
      error => console.error("Error al listar participantes:", error)
    );
  }

  actualizarFotosPagina() {
    const inicio = (this.paginaActual - 1) * this.fotosPorPagina;
    const fin = inicio + this.fotosPorPagina;
    this.fotosPagina = this.fotos.slice(inicio, fin);
  }

  //Función para filtrar por estado las fotografías
  filtrarPorEstado() {
    console.log("Filtrando por estado:", this.filtroEstado);
    this.paginaActual = 1;
    this.listarFotos();
  }

  siguientePagina() {
    if (this.paginaActual < this.totalPaginas()) {
      this.paginaActual++;
      this.actualizarFotosPagina();
    }
  }

  anteriorPagina() {
    if (this.paginaActual > 1) {
      this.paginaActual--;
      this.actualizarFotosPagina();
    }
  }

  totalPaginas(): number {
    return Math.ceil(this.fotos.length / this.fotosPorPagina);
  }

  getNombreAutor(idParticipante: number): string {
    const participante = this.participantes.find(p => p.id === idParticipante);
    return participante ? `${participante.nombre} ${participante.apellidos}` : 'Desconocido';
  }

  eliminarFoto(idFoto: number) {
    if (confirm("¿Estás seguro de eliminar la foto? Esta acción no se podrá deshacer.")) {
      this.serviceVotos.borrarVotosIDs(idFoto, 0).subscribe(
        respuesta => {
          if (respuesta) {
            console.log(respuesta);

            this.serviceFotos.borrarFoto(idFoto).subscribe(
              respuesta => {
                if (respuesta.fotoBorrada) {
                  alert(respuesta.fotoBorrada);

                  this.fotos = [];
                  this.fotosPagina = [];
                  this.cargando = true;

                  //this.listarFotos();
                  this.listarParticipantes();
                }
              }, error => console.error("Error al eliminar la foto en el Panel de Administración :>> ", error)
            )
          }
        }, error => console.error("Error al borrar los votos de la foto en Administración :>>", error)
      )
    }
  }

  //Función para abrir el modal de la foto
  openModal(imageSrc: any) {
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

  cambiarEstado(foto: Foto) {
    //console.log("Entra en cambiarEstado :>> ", foto);

    this.serviceFotos.cambiarEstado(foto).subscribe(
      respuesta => {
        if (respuesta.success) console.log(respuesta.success);
      }, error => console.error("Error al cambiar el estado de la foto :>> ", error)
    )
  }
}