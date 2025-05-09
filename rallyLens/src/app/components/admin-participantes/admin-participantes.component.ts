import { Component } from '@angular/core';
import { ServiceParticipanteService } from '../../services/service-participante.service';
import { ServiceFotoService } from '../../services/service-foto.service';
import { Participante } from '../../modules/participante';
import { Router } from '@angular/router';

@Component({
  selector: 'app-admin-participantes',
  standalone: false,
  templateUrl: './admin-participantes.component.html',
  styleUrl: './admin-participantes.component.css'
})
export class AdminParticipantesComponent {
  participantes: Participante[] = [];
  participantesPagina: Participante[] = [];
  numFotos: number = 0;
  numVotos: number = 0;

  paginaActual: number = 1;
  participantesPorPagina: number = 10;

  terminoBusqueda: string = '';

  constructor(
    private serviceParticipantes: ServiceParticipanteService,
    private serviceFotos: ServiceFotoService,
    private route: Router
  ) { }

  ngOnInit() {
    console.log("Entra en admin-participantes");

    this.serviceParticipantes.listarParticipantes().subscribe(
      datos => {
        if (datos) {
          this.participantes = datos;
          this.actualizarParticipantesPagina();
        }
        console.log("datos :>> ", datos);
      },
      error => console.error("Error al listar los participantes :>> ", error)
    );

    this.serviceFotos.listarFotos().subscribe(
      datos => {
        console.log("Fotos :>> ", datos);
        console.log("Total de fotos :>> ", datos.length);

        this.numFotos = datos.length;
        datos.forEach(foto => this.numVotos += foto.votos);
      },
      error => console.error("Error al obtener el listado de fotos :>> ", error)
    );
  }

  actualizarParticipantesPagina() {
    if (this.terminoBusqueda) {
      this.filtrarParticipantes();
      return;
    }
    
    const inicio = (this.paginaActual - 1) * this.participantesPorPagina;
    const fin = inicio + this.participantesPorPagina;
    this.participantesPagina = this.participantes.slice(inicio, fin);
  }

  filtrarParticipantes() {
    if (!this.terminoBusqueda) {
      this.actualizarParticipantesPagina();
      return;
    }
  
    const termino = this.terminoBusqueda.toLowerCase();
    
    const participantesFiltrados = this.participantes.filter(participante => {
      //Función para convertir cualquier valor a string y luego a minúsculas
      const safeToString = (value: any): string => {
        if (value === null || value === undefined) return '';
        return String(value).toLowerCase();
      };
  
      return safeToString(participante.nombre).includes(termino) ||
             safeToString(participante.apellidos).includes(termino) ||
             safeToString(participante.telefono).includes(termino) ||
             safeToString(participante.correo).includes(termino) ||
             safeToString(participante.id).includes(termino);
    });
  
    this.participantesPagina = participantesFiltrados.slice(0, participantesFiltrados.length);
  }

  siguientePagina() {
    if (this.paginaActual < this.totalPaginas()) {
      this.paginaActual++;
      this.actualizarParticipantesPagina();
    }
  }

  anteriorPagina() {
    if (this.paginaActual > 1) {
      this.paginaActual--;
      this.actualizarParticipantesPagina();
    }
  }

  totalPaginas(): number {
    return Math.ceil(this.participantes.length / this.participantesPorPagina);
  }

  eliminarParticipante(participante: Participante) {
    console.log("Entra en eliminarParticipante :>> ", participante);

    if (confirm("¿Estás seguro de que quieres eliminar a " + participante.nombre + " " + participante.apellidos + "? No se podrá deshacer.")) {
      this.serviceParticipantes.eliminarParticipante(participante.id).subscribe(
        respuesta => {
          if (respuesta.success) {
            alert("El participante ha sido eliminado de la base de datos incluídas sus fotos correctamente.");

            this.serviceParticipantes.listarParticipantes().subscribe(
              datos => {
                if (datos) {
                  this.participantes = datos;
                  if (this.paginaActual > this.totalPaginas()) this.paginaActual = this.totalPaginas();
                  this.actualizarParticipantesPagina();
                }
              },
              error => console.error("Error al listar los participantes :>> ", error)
            );

            this.serviceFotos.listarFotos().subscribe(
              datos => {
                console.log("Fotos :>> ", datos);
                console.log("Total de fotos :>> ", datos.length);

                this.numFotos = datos.length;

                this.numVotos = 0;
                
                datos.forEach(foto => this.numVotos += foto.votos);
              },
              error => console.error("Error al obtener el listado de fotos :>> ", error)
            );
          }
        },
        error => console.error("Error al eliminar al participante :>> ", error)
      );
    }
  }

  verParticipante(idParticipante: number) {
    console.log("Entra en verParticipante :>> ", idParticipante);
    
    if(idParticipante) {
      //console.log("Existe");

      this.serviceParticipantes.obtenerParticipanteID(idParticipante).subscribe(
        datos => {
          console.log("Participante para ver en el panel de adinistración :>> ", datos);

          if(datos) {
            let participanteVisto = JSON.stringify(datos);
            //console.log(participanteVisto);
            
            localStorage.setItem("participanteLogueado", participanteVisto);

            if(localStorage.getItem("participanteLogueado")) {
              this.route.navigate(['/perfil-participante']);
            }
          }
          
        }, error => console.error("Error al obtener el participante para ver en el panel de administración :>> ", error)
      )
    }
  }
}