import { Component } from '@angular/core';
import { ServiceParticipanteService } from '../../services/service-participante.service';
import { ServiceFotoService } from '../../services/service-foto.service';

@Component({
  selector: 'app-admin-participantes',
  standalone: false,
  templateUrl: './admin-participantes.component.html',
  styleUrl: './admin-participantes.component.css'
})
export class AdminParticipantesComponent {
  participantes: any[] = [];
  numFotos: number = 0;
  numVotos: number = 0;

  constructor(private serviceParticipantes: ServiceParticipanteService, private serviceFotos: ServiceFotoService) {}

  ngOnInit() {
    console.log("Entra en admin-participantes");

    this.serviceParticipantes.listarParticipantes().subscribe(
      (datos: any) => {
        console.log("Participantes :>> ", datos);
        if (datos.success) {
          this.participantes = datos.data;
        } else {
          console.error("Error al obtener participantes:", datos.error);
        }
      }, 
      error => console.error("Error al obtener los participantes :>> ", error)
    );

    this.serviceFotos.listarFotos().subscribe(
      datos => {
        console.log("Fotos :>> ", datos);
        console.log("Total de fotos :>> ", datos.length);
        
        this.numFotos = datos.length;

        datos.forEach(foto => {
          this.numVotos += foto.votos;
        });
      }, error => console.error("Error al obtener el listado de fotos :>> ", error)
    )
  }
}
