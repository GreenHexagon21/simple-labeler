import { Component, HostListener } from '@angular/core';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent {
  title = 'simple-labeler';

  @HostListener('window:keydown', ['$event'])
  handleKeydown(event: KeyboardEvent): void {
    switch (event.key) {
      case 'ű':
        this.hide();
        event.preventDefault();
        break;
    }
  }
  hide() {
    window.location.href = 'http://localhost:4200/';
  }
}
