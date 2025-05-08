import { Component } from '@angular/core';
import { Foto } from '../../modules/foto';
import { Participante } from '../../modules/participante';
import { ServiceFotoService } from '../../services/service-foto.service';
import { ServiceParticipanteService } from '../../services/service-participante.service';

@Component({
  selector: 'app-admin-fotografias',
  standalone: false,
  templateUrl: './admin-fotografias.component.html',
  styleUrl: './admin-fotografias.component.css'
})
export class AdminFotografiasComponent {

  fotos: Foto[] = [];
  fotosPagina: Foto[] = [];
  participantes: Participante[] = [];
  numVotos: number = 0;
  numParticipantes: number = 0;

  paginaActual: number = 1;
  fotosPorPagina: number = 10;

  filtroEstado: string = 'TODAS';

  constructor(
    private serviceFotos: ServiceFotoService,
    private serviceParticipantes: ServiceParticipanteService
  ) { }

  ngOnInit() {
    console.log("Entra en admin-fotografias");

    this.serviceFotos.listarFotos().subscribe(
      datos => {
        if (datos) {
          this.fotos = datos;
          this.numVotos = datos.reduce((total, foto) => total + foto.votos, 0);
          this.actualizarFotosPagina();
        }
      },
      error => console.error("Error al listar las fotos:", error)
    );

    this.serviceParticipantes.listarParticipantes().subscribe(
      datos => {
        if (datos) {
          this.participantes = datos;
          this.numParticipantes = datos.length;
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

  filtrarPorEstado() {
    // Esta función la implementarás según tus necesidades
    console.log("Filtrando por estado:", this.filtroEstado);
    this.paginaActual = 1;
    this.actualizarFotosPagina();
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
}
