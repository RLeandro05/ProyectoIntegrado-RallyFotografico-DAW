import { Component } from '@angular/core';
import { Participante } from '../../modules/participante';
import { Foto } from '../../modules/foto';
import { ServiceParticipanteService } from '../../services/service-participante.service';
import { ServiceFotoService } from '../../services/service-foto.service';

@Component({
  selector: 'app-ranking',
  standalone: false,
  templateUrl: './ranking.component.html',
  styleUrl: './ranking.component.css'
})
export class RankingComponent {
  topParticipantes: Participante[] = [];
  topFotos: Foto[] = [];
  
  participantes: Participante[] = [];
  fotos: Foto[] = [];

  constructor(
    private serviceParticipante: ServiceParticipanteService,
    private serviceFoto: ServiceFotoService
  ) { }

  ngOnInit() {
    this.cargarParticipantes();
  }

  cargarParticipantes() {
    this.serviceParticipante.listarParticipantes().subscribe(
      datos => {
        if(datos) {
          this.participantes = datos;
          this.cargarFotos();
        }
      }, error => console.error("Error al cargar los participantes :>> ", error)
    )
  }

  cargarFotos() {
    this.serviceFoto.listarFotos().subscribe(
      datos => {
        if(datos) {
          this.fotos = datos;
          this.calcularTopParticipantes();
          this.calcularTopFotos();
        }
      }, error => console.error("Error al cargar las fotos :>>", error)
    )
  }

  calcularTopParticipantes() {
    //Ordenar participantes por votos totales
    const participantesConVotos = this.participantes.map(participante => ({
      ...participante,
      votosTotales: this.obtenerVotosTotalesParticipante(participante.id)
    }));

    console.log("participantesConVotos :>> ", participantesConVotos);
    

    //Ordenar de mayor a menor votos y tomar los primeros 3
    this.topParticipantes = [...participantesConVotos]
      .sort((a, b) => b.votosTotales - a.votosTotales)
      .slice(0, 3);
      
  }

  calcularTopFotos() {
    //Ordenar fotos por votos y tomar las 3 más votadas
    this.topFotos = [...this.fotos]
      .filter(foto => foto.estado === "aceptada")
      .sort((a, b) => b.votos - a.votos)
      .slice(0, 3);

      console.log("topFotos :>> ", this.topFotos);
      
  }

  obtenerVotosTotalesParticipante(idParticipante: number) {
    //Sumar todos los votos de las fotos de un participante
    return this.fotos
      .filter(foto => foto.id_participante === idParticipante && foto.estado === "aceptada")
      .reduce((sum, foto) => sum + foto.votos, 0);
  }

  obtenerParticipanteFoto(idParticipante: number) {
    const participante = this.participantes.find(p => p.id === idParticipante);
    if (participante && participante.foto_perfil) {
      return participante.foto_perfil;
    }
    return '/assets/perfilDefecto.png'; //Imagen por defecto
  }

  /*getPhotoUrl(photoId: number) {
    const photo = this.fotos.find(p => p.id === photoId);
    if (photo && photo.imagen) {
      if (photo.imagen instanceof Blob) {
        return URL.createObjectURL(photo.imagen);
      } else if (typeof photo.imagen === 'string') {
        return photo.imagen; // Ya es una URL válida
      }
    }
    return '/assets/default-photo.jpg'; // Imagen por defecto
  }*/


  obtenerNombreParticipante(idParticipante: number) {
    const participante = this.participantes.find(p => p.id === idParticipante);
    return participante ? `${participante.nombre} ${participante.apellidos}` : 'Autor desconocido';
  }
}
