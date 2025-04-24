import { Component } from '@angular/core';

@Component({
  selector: 'app-admin-participantes',
  standalone: false,
  templateUrl: './admin-participantes.component.html',
  styleUrl: './admin-participantes.component.css'
})
export class AdminParticipantesComponent {


  ngOnInit() {
      console.log("Entra en admin-participantes");
  }
}
