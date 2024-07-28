import { Component, ElementRef, Input, Output, EventEmitter, ViewChild, HostListener } from '@angular/core';

@Component({
  selector: 'app-image-checkbox',
  templateUrl: './image-checkbox.component.html',
  styleUrls: ['./image-checkbox.component.scss']
})
export class ImageCheckboxComponent {
  @Input() checked: boolean = false;
  @Input() label: string;
  @Input() image: string;
  @ViewChild('checkbox', { static: true }) checkbox: ElementRef;
  @Output() checkboxChanged = new EventEmitter<string>();

  @HostListener('keydown', ['$event'])
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

  toggleCheckbox(): void {
    this.checked = !this.checked;
    this.checkbox.nativeElement.checked = this.checked; // Ensure the checkbox state is visually updated
    this.checkboxChanged.emit(this.checked ? this.label : '');
  }

  focusPreviousCheckbox(): void {
    this.focusCheckbox(-1);
  }

  focusNextCheckbox(): void {
    this.focusCheckbox(1);
  }

  private focusCheckbox(offset: number): void {
    const checkboxes = document.querySelectorAll('input[type="checkbox"]');
    const currentIndex = Array.prototype.indexOf.call(checkboxes, this.checkbox.nativeElement);
    const newIndex = (currentIndex + offset + checkboxes.length) % checkboxes.length;
    const newCheckbox = checkboxes[newIndex] as HTMLElement;
    newCheckbox.focus();
  }
}
