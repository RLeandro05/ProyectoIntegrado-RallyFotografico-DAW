import { Component } from '@angular/core';
import { ServiceParticipanteService } from '../../services/service-participante.service';
import { ServiceFotoService } from '../../services/service-foto.service';
import { Participante } from '../../modules/participante';

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
      datos => {
        if(datos) this.participantes = datos;
        console.log("datos :>> ", datos);
        
      }, error => console.error("Error al listar los participantes :>> ", error)
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

  eliminarParticipante(participante: Participante) {
    console.log("Entra en eliminarParticipante :>> ", participante);
    
    if(confirm("¿Estás seguro de que quieres eliminar a '"+participante.nombre+" "+participante.apellidos+"'? No se podrá deshacer.")) {
      this.serviceParticipantes.eliminarParticipante(participante.id).subscribe(
        respuesta => {
          if(respuesta.success) {
            alert("El participante ha sido eliminado de la base de datos incluídas sus fotos correctamente.");

            this.serviceParticipantes.listarParticipantes().subscribe(
              datos => {
                if(datos) this.participantes = datos;
                console.log("datos :>> ", datos);
                
              }, error => console.error("Error al listar los participantes :>> ", error)
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
        }, error => console.error("Error al eliminar al participante :>> ", error)
      )
    }
  }
}
