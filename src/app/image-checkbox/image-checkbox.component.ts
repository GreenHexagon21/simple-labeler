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
  @Input() groupLabel: string;
  @Input() id: string; // New input for id
  @ViewChild('checkbox', { static: true }) checkbox: ElementRef;
  @Output() checkboxChanged = new EventEmitter<object>();

  @HostListener('keydown', ['$event'])
  handleKeydown(event: KeyboardEvent): void {
    event.stopPropagation();
    if (event.shiftKey && event.key === 'ArrowDown') {
      event.preventDefault();
    } else {
      switch (event.key) {
        case 'Enter':
          this.toggleCheckbox();
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
  }

  toggleCheckbox(): void {
    this.checked = !this.checked;
    this.checkbox.nativeElement.checked = this.checked; // Ensure the checkbox state is visually updated
    this.checkboxChanged.emit({ checked: this.checked, label: this.label, groupLabel: this.groupLabel });
  }

  focusPreviousCheckbox(): void {
    this.focusCheckbox(-1);
  }

  focusNextCheckbox(): void {
    this.focusCheckbox(1);
  }

  private focusCheckbox(offset: number): void {
    // Get all checkbox elements by their IDs in order
    const checkboxes = Array.from(document.querySelectorAll('input[type="checkbox"]')) as HTMLInputElement[];
    
    // Get the current index of the focused checkbox
    const currentIndex = checkboxes.findIndex(cb => cb.id === this.id);

    // Calculate the new index to focus, ensuring it wraps around
    const newIndex = (currentIndex + offset + checkboxes.length) % checkboxes.length;

    // Focus the new checkbox
    checkboxes[newIndex].focus();
  }
}
