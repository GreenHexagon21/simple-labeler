// app-image-checkbox.component.ts
import { Component, ElementRef, Input, ViewChild } from '@angular/core';

@Component({
  selector: 'app-image-checkbox',
  templateUrl: './image-checkbox.component.html',
  styleUrls: ['./image-checkbox.component.scss']
})
export class ImageCheckboxComponent {
  @Input() checked: boolean = false;
  @Input() label: string;
  @Input() image;
  @ViewChild('checkbox', { static: true }) checkbox: ElementRef;

  handleKeydown(event: KeyboardEvent): void {
    switch (event.key) {
      case 'Enter':
        this.checked = !this.checked;
        event.preventDefault();
        break;
      case 'ArrowUp':
        this.focusPreviousCheckbox();
        event.preventDefault();
        break;
      case 'ArrowDown':
        this.focusNextCheckbox();
        event.preventDefault();
        break;
    }
  }

  focusPreviousCheckbox(): void {
    // Custom event to notify parent to focus the previous checkbox
    this.checkbox.nativeElement.dispatchEvent(new CustomEvent('focusPreviousCheckbox', { bubbles: true }));
  }

  focusNextCheckbox(): void {
    // Custom event to notify parent to focus the next checkbox
    this.checkbox.nativeElement.dispatchEvent(new CustomEvent('focusNextCheckbox', { bubbles: true }));
  }
}
