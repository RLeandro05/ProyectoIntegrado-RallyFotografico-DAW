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

  constructor(
    private serviceFotografias: ServiceFotoService, 
    private serviceParticipantes: ServiceParticipanteService
  ) {}

  ngOnInit() {
    this.cargarFotos();
  }

  cargarFotos() {
    this.serviceFotografias.listarFotos().subscribe(
      fotos => {
        if(fotos) {
          this.fotosAceptadas = fotos.filter(foto => foto.estado === "aceptada");
          this.fotosAceptadas.forEach(foto => {
            
            this.serviceParticipantes.obtenerParticipanteID(foto.id_participante).subscribe(
              participante => {
                if (participante) this.mapaFotosParticipantes.set(foto, participante);
              },
              error => console.error("Error al obtener participante:", error)
            );
          });
        }
      }, 
      error => console.error("Error al listar las fotos :>> ", error)
    );
  }

  sumarVoto(idFoto: number) {
    console.log("Entra en sumarVoto :>> ", idFoto);
    
    this.serviceFotografias.sumarVoto(idFoto).subscribe(
      respuesta => {
        if(respuesta.success) {
          const fotografiaActualizadaVotos = this.fotosAceptadas.find(foto => foto.id === idFoto);
          
          if(fotografiaActualizadaVotos) fotografiaActualizadaVotos.votos += 1;
          
        }
      }, error => console.error("Error al realizar el voto :>> ", error)
    )
  }
}
