import { Component } from '@angular/core';

@Component({
  selector: 'app-home',
  standalone: false,
  templateUrl: './home.component.html',
  styleUrl: './home.component.css'
})
export class HomeComponent {

  public adminLogueado: any;
  public participanteLogueado: any;
  public isAdminLoged: boolean = false;
  public isParticipanteLoged: boolean = false;
  public isEditingRules: boolean = false;

  public formatOptions = ['PNG', 'JPG', 'JPEG', 'WEBP', 'SVG'];


  //Valores por defecto para las bases del concurso por primera vez
  public contestRules = {
    allowedFormats: 'PNG, JPG, JPEG',
    maxSize: 20,
    maxPhotos: 3,
    maxVotes: 3
  };

  //Variable auxiliar para que, en caso de cancelar los cambios, mantener los originales
  public originalRules: any;

  ngOnInit() {
    console.log(this.formatOptions);
    
    this.adminLogueado = localStorage.getItem("adminLogueado");
    if (this.adminLogueado) this.isAdminLoged = true;

    this.participanteLogueado = localStorage.getItem("participanteLogueado");
    if (this.participanteLogueado) this.isParticipanteLoged = true;

    //Obtener, si existen, las bases del concurso actuales del localstorage
    const savedRules = localStorage.getItem('contestRules');
    if (savedRules) {
      this.contestRules = JSON.parse(savedRules);
    }
  }

  //Función para mostrar el formulario u ocultarlo
  toggleEditRules() {
    this.isEditingRules = !this.isEditingRules;

    //En caso de que se quiera editar las bases, guardar como copia de seguridad las bases originales
    if (this.isEditingRules) {
      this.originalRules = { ...this.contestRules };
    }
  }

  //Función para que, al pinchar en Guardar las nuevas bases, se actualice en el localstorage
  saveRules() {
    localStorage.setItem('contestRules', JSON.stringify(this.contestRules));
    this.isEditingRules = false;

    //Mostrar mensaje de éxito
    alert("Las bases del concurso han sido actualizadas correctamente.");
  }

  //Función para que, al cancelar la edición de las bases, se restauren las bases con la copia ya guardada de antemano
  cancelEdit() {
    this.contestRules = { ...this.originalRules };
    this.isEditingRules = false;
  }
}
