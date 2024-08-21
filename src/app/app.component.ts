import { Component, HostListener, Renderer2 } from '@angular/core';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
})
export class AppComponent {
  title = 'simple-labeler';
  imagesEnabled = true;
  constructor(private renderer: Renderer2) {}

  @HostListener('window:keydown', ['$event'])
  handleKeydown(event: KeyboardEvent): void {
    switch (event.key) {
      case 'ű':
        this.hide();
        event.preventDefault();
        break;
      case 'Insert':
        this.toggleImages();
        event.preventDefault();
        break;
    }
  }

  hide() {
    window.location.href = 'http://localhost:4200/';
  }

  toggleImages() {
    this.imagesEnabled = !this.imagesEnabled;
    const images = document.getElementsByTagName('img');
    for (let i = 0; i < images.length; i++) {
      if (this.imagesEnabled) {
        this.renderer.setStyle(images[i], 'display', 'block');
      } else {
        this.renderer.setStyle(images[i], 'display', 'none');
      }
     
    }
  }
}
