import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-image-checkbox',
  templateUrl: './image-checkbox.component.html',
  styleUrl: './image-checkbox.component.scss'
})
export class ImageCheckboxComponent {

  @Input() image;
  @Input() checked;
  @Input() label;

  toggleCheckbox(event: KeyboardEvent): void {
    if (event.key === 'Enter') {
      this.checked;
      event.preventDefault(); // Prevents the default action of the enter key
    }
  }

}
