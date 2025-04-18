import { Component } from '@angular/core';

@Component({
  selector: 'app-home',
  standalone: false,
  templateUrl: './home.component.html',
  styleUrl: './home.component.css'
})
export class HomeComponent {

  public adminLogueado: any;
  public isAdminLoged: boolean = false;
  public isEditingRules: boolean = false;

  public contestRules = {
    allowedFormats: 'PNG, JPG, JPEG',
    maxSize: 20,
    maxPhotos: 3,
    maxVotes: 3
  };

  public originalRules: any;

  ngOnInit() {
    this.adminLogueado = localStorage.getItem("adminLogueado");
    if (this.adminLogueado) this.isAdminLoged = true;

    //Cargar reglas desde localStorage si existen
    const savedRules = localStorage.getItem('contestRules');
    if (savedRules) {
      this.contestRules = JSON.parse(savedRules);
    }
  }

  toggleEditRules() {
    this.isEditingRules = !this.isEditingRules;
    if (this.isEditingRules) {

      //Guardar una copia de las reglas originales para poder cancelar
      this.originalRules = { ...this.contestRules };
    }
  }

  saveRules() {
    localStorage.setItem('contestRules', JSON.stringify(this.contestRules));
    this.isEditingRules = false;

    alert("Las bases del concurso han sido actualizadas correctamente.");
  }

  cancelEdit() {
    //Restaurar las reglas originales
    this.contestRules = { ...this.originalRules };
    this.isEditingRules = false;
  }
}
