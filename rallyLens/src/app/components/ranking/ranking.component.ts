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
  topParticipants: Participante[] = [];
  topPhotos: Foto[] = [];
  allParticipants: Participante[] = [];
  allPhotos: Foto[] = [];

  constructor(
    private participantService: ServiceParticipanteService,
    private photoService: ServiceFotoService
  ) { }

  ngOnInit(): void {
    this.loadParticipants();
    this.loadPhotos();
  }

  loadParticipants(): void {
    this.participantService.listarParticipantes().subscribe({
      next: (participants: Participante[]) => {
        this.allParticipants = participants;
        this.calculateTopParticipants();
      },
      error: (err) => console.error('Error loading participants:', err)
    });
  }

  loadPhotos(): void {
    this.photoService.listarFotos().subscribe({
      next: (photos: Foto[]) => {
        this.allPhotos = photos;
        this.calculateTopPhotos();
      },
      error: (err) => console.error('Error loading photos:', err)
    });
  }

  calculateTopParticipants(): void {
    // Ordenar participantes por votos totales
    const participantsWithVotes = this.allParticipants.map(participant => ({
      ...participant,
      totalVotes: this.getTotalVotes(participant.id)
    }));

    // Ordenar de mayor a menor votos y tomar los primeros 3
    this.topParticipants = [...participantsWithVotes]
      .sort((a, b) => b.totalVotes - a.totalVotes)
      .slice(0, 3);
  }

  calculateTopPhotos(): void {
    // Ordenar fotos por votos y tomar las 3 más votadas
    this.topPhotos = [...this.allPhotos]
      .sort((a, b) => b.votos - a.votos)
      .slice(0, 3);
  }

  getTotalVotes(participantId: number): number {
    // Sumar todos los votos de las fotos de un participante
    return this.allPhotos
      .filter(photo => photo.id_participante === participantId)
      .reduce((sum, photo) => sum + photo.votos, 0);
  }

  getParticipantPhoto(participantId: number): string {
    const participant = this.allParticipants.find(p => p.id === participantId);
    if (participant && participant.foto_perfil) {
      // Asumiendo que la foto de perfil es un Blob y necesitas convertirlo a URL
      return URL.createObjectURL(participant.foto_perfil);
    }
    return '/assets/default-profile.png'; // Imagen por defecto
  }

  getPhotoUrl(photoId: number): string {
    const photo = this.allPhotos.find(p => p.id === photoId);
    if (photo && photo.imagen) {
      if (photo.imagen instanceof Blob) {
        return URL.createObjectURL(photo.imagen);
      } else if (typeof photo.imagen === 'string') {
        return photo.imagen; // Ya es una URL válida
      }
    }
    return '/assets/default-photo.jpg'; // Imagen por defecto
  }


  getParticipantName(participantId: number): string {
    const participant = this.allParticipants.find(p => p.id === participantId);
    return participant ? `${participant.nombre} ${participant.apellidos}` : 'Autor desconocido';
  }
}
