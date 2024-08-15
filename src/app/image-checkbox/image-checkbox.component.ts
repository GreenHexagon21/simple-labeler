import {
  Component,
  ElementRef,
  Input,
  Output,
  EventEmitter,
  ViewChild,
  HostListener,
} from '@angular/core';

@Component({
  selector: 'app-image-checkbox',
  templateUrl: './image-checkbox.component.html',
  styleUrls: ['./image-checkbox.component.scss'],
})
export class ImageCheckboxComponent {
  @Input() checked: boolean = false;
  @Input() label: string;
  @Input() image: string;
  @Input() groupLabel: string;
  @Input() id: string; // New input for id
  @ViewChild('checkbox', { static: true }) checkbox: ElementRef;
  @Output() checkboxChanged = new EventEmitter<object>();
  @Output() arrowRight = new EventEmitter<number>();
  @Output() arrowLeft = new EventEmitter<number>();

  @HostListener('keydown', ['$event'])
  handleKeydown(event: KeyboardEvent): void {
    event.stopPropagation();
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
      case 'PageUp':
        this.focusPreviousGroup();
        event.preventDefault();
        break;
      case 'PageDown':
        this.focusNextGroupCheckbox();
        event.preventDefault();
        break;
      case 'ArrowLeft':
        this.arrowLeft.emit(-1);
        event.preventDefault();
        break;
      case 'ArrowRight':
        this.arrowRight.emit(1);
        event.preventDefault();
        break;
    }
  }

  toggleCheckbox(): void {
    this.checked = !this.checked;
    //this.checkbox.nativeElement.checked = this.checked; // Ensure the checkbox state is visually updated
    if (this.label) {
      this.checkboxChanged.emit({
        checked: this.checked,
        label: this.label,
        groupLabel: this.groupLabel,
      });
    }
  }

  focusPreviousCheckbox(): void {
    this.focusCheckbox(-1);
  }

  focusNextCheckbox(): void {
    this.focusCheckbox(1);
  }

  focusPreviousGroup(): void {
    this.focusPreviousGroupCheckbox();
  }

  focusNextGroup(): void {
    this.focusNextGroupCheckbox();
  }

  private focusCheckbox(offset: number): void {
    const checkboxes = Array.from(
      document.querySelectorAll('input[type="checkbox"]')
    ) as HTMLInputElement[];
    const currentIndex = checkboxes.findIndex((cb) => cb.id === this.id);
    const newIndex =
      (currentIndex + offset + checkboxes.length) % checkboxes.length;
      checkboxes[newIndex].closest('.checkbox-flex').scrollIntoView({ behavior: "smooth", block: "center" })
    checkboxes[newIndex].focus();
  }

  private focusNextGroupCheckbox() {
    let offset = 1;
    const checkboxes = Array.from(
      document.querySelectorAll('input[type="checkbox"]')
    ) as HTMLInputElement[];
    const currentIndex = checkboxes.findIndex((cb) => cb.id === this.id);
    let newIndex =
      (currentIndex + offset + checkboxes.length) % checkboxes.length;
    while (
      checkboxes[newIndex].closest('.group').id ==
      checkboxes[currentIndex].closest('.group').id
    ) {
      offset++;
      newIndex =
        (currentIndex + offset + checkboxes.length) % checkboxes.length;
    }
    checkboxes[newIndex].focus();
  }
  private focusPreviousGroupCheckbox() {
    let offset = -1;
    const checkboxes = Array.from(
      document.querySelectorAll('input[type="checkbox"]')
    ) as HTMLInputElement[];
    const currentIndex = checkboxes.findIndex((cb) => cb.id === this.id);
    let newIndex =
      (currentIndex + offset + checkboxes.length) % checkboxes.length;
    while (
      checkboxes[newIndex].closest('.group').id ==
      checkboxes[currentIndex].closest('.group').id
    ) {
      offset--;
      newIndex =
        (currentIndex + offset + checkboxes.length) % checkboxes.length;
    }
    console.log(newIndex);
    checkboxes[newIndex].focus();
  }
}
