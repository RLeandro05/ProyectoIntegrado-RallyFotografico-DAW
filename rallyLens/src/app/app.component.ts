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

  @HostListener('window:scroll', [])
  onWindowScroll(): void {
    if (window.scrollY > 50 && this.scrollTopBtn) {
      this.scrollTopBtn.style.display = 'block';
    } else if (this.scrollTopBtn) {
      this.scrollTopBtn.style.display = 'none';
    }
  }

  scrollToTop(): void {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  }
}
