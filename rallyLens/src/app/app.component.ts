import { Component, HostListener } from '@angular/core';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  standalone: false,
  styleUrl: './app.component.css'
})
export class AppComponent {
  title = 'rallyLens';

  scrollTopBtn: HTMLElement | null = null;

  ngOnInit(): void {
    this.scrollTopBtn = document.getElementById('scrollTopBtn');
  }

  // Mostrar u ocultar el botón al hacer scroll
  @HostListener('window:scroll', [])
  onWindowScroll(): void {
    if (window.scrollY > 200 && this.scrollTopBtn) {
      this.scrollTopBtn.style.display = 'block';
    } else if (this.scrollTopBtn) {
      this.scrollTopBtn.style.display = 'none';
    }
  }

  // Función para hacer scroll hacia arriba
  scrollToTop(): void {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  }
}
