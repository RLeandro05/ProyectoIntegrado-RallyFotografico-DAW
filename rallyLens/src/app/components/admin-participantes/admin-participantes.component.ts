import { Component } from '@angular/core';
import { ServiceParticipanteService } from '../../services/service-participante.service';

@Component({
  selector: 'app-admin-participantes',
  standalone: false,
  templateUrl: './admin-participantes.component.html',
  styleUrl: './admin-participantes.component.css'
})
export class AdminParticipantesComponent {
  participantes: any[] = [];

  constructor(private serviceParticipantes: ServiceParticipanteService) {}

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
  }
}
