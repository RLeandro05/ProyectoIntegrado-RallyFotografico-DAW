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
  
}
