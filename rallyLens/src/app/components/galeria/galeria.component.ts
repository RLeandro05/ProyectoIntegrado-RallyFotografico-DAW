import { Component } from '@angular/core';
import { Foto } from '../../modules/foto';
import { Participante } from '../../modules/participante';
import { ServiceFotoService } from '../../services/service-foto.service';
import { ServiceParticipanteService } from '../../services/service-participante.service';
import { Router } from '@angular/router';
import { ServiceVotoService } from '../../services/service-voto.service';

@Component({
  selector: 'app-galeria',
  standalone: false,
  templateUrl: './galeria.component.html',
  styleUrl: './galeria.component.css'
})
export class GaleriaComponent {

  cargando: boolean = true;

  fotosAceptadas: Foto[] = [];
  mapaFotosParticipantes = new Map<Foto, Participante>;

  votosRealizados = new Set<number>();

  fotosPagina: Foto[] = [];
  paginaActual: number = 1;
  fotosPorPagina: number = 10;

  participanteLogueado: any = null;


  constructor(
    private serviceFotografias: ServiceFotoService,
    private serviceParticipantes: ServiceParticipanteService,
    private serviceVotos: ServiceVotoService,
    private route: Router
  ) { }

  ngOnInit() {
    this.cargarFotos();

    const participanteGuardado = localStorage.getItem("participanteLogueado");

    if (participanteGuardado) {
      this.participanteLogueado = JSON.parse(participanteGuardado);
    }
  }
  onImageLoad() {
  console.log("Imagen Cargada");
}


  cargarFotos() {
    this.cargando = true;
    this.serviceFotografias.listarFotos().subscribe(
      fotos => {
        if (fotos) {
          this.fotosAceptadas = fotos.filter(foto => foto.estado === "aceptada");
          this.actualizarFotosPagina(); // <- justo después del filtrado

          console.log('Total fotos recibidas:', fotos.length);
          console.log('Fotos aceptadas:', this.fotosAceptadas.length);


          // Cargar participantes
          this.fotosAceptadas.forEach(foto => {
            this.serviceParticipantes.obtenerParticipanteID(foto.id_participante).subscribe(
              participante => {
                if (participante) this.mapaFotosParticipantes.set(foto, participante);
              },
              error => console.error("Error al obtener participante:", error)
            );
          });

          if (this.participanteLogueado) this.obtenerVotosParticipante(this.participanteLogueado.id);
          this.actualizarFotosPagina();
        }

        this.cargando = false;
      },
      error => console.error("Error al listar las fotos :>> ", error)
    );
  }

  obtenerVotosParticipante(idParticipante: number) {
    this.serviceVotos.obtenerVotosParticipante(idParticipante).subscribe(
      votos => {
        if (votos) {
          votos.forEach(voto => {
            this.votosRealizados.add(voto.id_fotografia);
          });
        };

      }, error => console.error("Error al obtener todos los votos del participante :>> ", error)
    )
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



  alternarVoto(idFoto: number, idParticipante: number, idParticipanteVotado: number) {
    console.log("Entra en sumarVoto :>> ", idFoto);

    this.serviceFotografias.alternarVoto(idFoto, idParticipante, idParticipanteVotado).subscribe(
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

  alertarRegistroLogueo(numero: number) {
    if (numero == 1) {
      if (!localStorage.getItem("adminLogueado")) {
        this.route.navigate(['/register-user']);
      } else {
        alert("Cierra sesión como admin y regístrate como participante.");
      }
    } else {
      if (!localStorage.getItem("adminLogueado")) {
        this.route.navigate(['/login-user']);
      } else {
        alert("Cierra sesión como admin e inicia sesión como participante.");
      }
    }
  }
}
