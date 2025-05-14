import { Component } from '@angular/core';
import { Foto } from '../../modules/foto';
import { Participante } from '../../modules/participante';
import { ServiceFotoService } from '../../services/service-foto.service';
import { ServiceParticipanteService } from '../../services/service-participante.service';
import { environment } from '../../../environments/environment.development';

@Component({
  selector: 'app-galeria',
  standalone: false,
  templateUrl: './galeria.component.html',
  styleUrl: './galeria.component.css'
})
export class GaleriaComponent {

  fotosAceptadas: Foto[] = [];
  mapaFotosParticipantes = new Map<Foto, Participante>;

  votosRealizados = new Set<number>();

  fotosPagina: Foto[] = [];
  paginaActual: number = 1;
  fotosPorPagina: number = 10; // Puedes ajustar el número según el diseño de la galería


  constructor(
    private serviceFotografias: ServiceFotoService,
    private serviceParticipantes: ServiceParticipanteService
  ) { }

  ngOnInit() {
    this.cargarFotos();
  }

  cargarFotos() {
    this.serviceFotografias.listarFotos().subscribe(
      fotos => {
        if (fotos) {
          this.fotosAceptadas = fotos.filter(foto => foto.estado === "aceptada");

          // Cargar participantes
          this.fotosAceptadas.forEach(foto => {
            this.serviceParticipantes.obtenerParticipanteID(foto.id_participante).subscribe(
              participante => {
                if (participante) this.mapaFotosParticipantes.set(foto, participante);
              },
              error => console.error("Error al obtener participante:", error)
            );
          });

          this.actualizarFotosPagina();
        }
      },
      error => console.error("Error al listar las fotos :>> ", error)
    );
  }

  actualizarFotosPagina() {
    const inicio = (this.paginaActual - 1) * this.fotosPorPagina;
    const fin = inicio + this.fotosPorPagina;
    this.fotosPagina = this.fotosAceptadas.slice(inicio, fin);
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
    return Math.ceil(this.fotosAceptadas.length / this.fotosPorPagina);
  }



  sumarVoto(idFoto: number, idParticipante: number) {
    console.log("Entra en sumarVoto :>> ", idFoto);

    this.serviceFotografias.alternarVoto(idFoto, idParticipante).subscribe(
      respuesta => {
        if (respuesta.votoRealizado) {
          const fotografiaActualizadaVotos = this.fotosAceptadas.find(foto => foto.id === idFoto);

          if (fotografiaActualizadaVotos) fotografiaActualizadaVotos.votos += 1;

          this.votosRealizados.add(idFoto);

        } else {
          const fotografiaActualizadaVotos = this.fotosAceptadas.find(foto => foto.id === idFoto);

          if (fotografiaActualizadaVotos) fotografiaActualizadaVotos.votos -= 1;

          this.votosRealizados.delete(idFoto);
        }
      }, error => console.error("Error al realizar el voto :>> ", error)
    )
  }
}
