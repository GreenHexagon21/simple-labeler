import { Component, QueryList, ViewChildren, ElementRef, AfterViewInit } from '@angular/core';
import { groups } from '../res/json/tags.json';

@Component({
  selector: 'app-file-selector',
  templateUrl: './file-selector.component.html',
  styleUrls: ['./file-selector.component.scss']
})
export class FileSelectorComponent implements AfterViewInit {
  images: { name: string, url: string }[] = [];
  currentImageIndex = 0;
  data: any = groups;
  label: string = '';
  checkedLabels: Set<string> = new Set();

  @ViewChildren('appImageCheckbox') checkboxes: QueryList<any>;

  ngAfterViewInit(): void {
    this.checkboxes.forEach((checkbox, index) => {
      checkbox.checkbox.nativeElement.addEventListener('focusPreviousCheckbox', () => this.focusPreviousCheckbox(index));
      checkbox.checkbox.nativeElement.addEventListener('focusNextCheckbox', () => this.focusNextCheckbox(index));
    });
  }

  onFolderSelect(event: any): void {
    const files = Array.from(event.target.files) as File[];
    this.images = [];

    files.forEach(file => {
      if (file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onload = (e: any) => {
          this.images.push({ name: file.name, url: e.target.result });
        };
        reader.readAsDataURL(file);
      }
    });
  }

  imageStep(amount: number): void {
    this.currentImageIndex += amount;

    // Uncheck all checkboxes
    this.uncheckAllCheckboxes();

    // Check if we should download the TXT file when "Next" is clicked
    if (amount > 0) {
      this.downloadTextFile();
    }
  }

  findImage(exampleImage: string): string {
    const foundImage = this.images.find(image => image.name === exampleImage);
    return foundImage ? foundImage.url : '';
  }

  focusPreviousCheckbox(index: number): void {
    if (index > 0) {
      const previousCheckbox = this.checkboxes.toArray()[index - 1].checkbox.nativeElement;
      previousCheckbox.focus();
    }
  }

  focusNextCheckbox(index: number): void {
    if (index < this.checkboxes.length - 1) {
      const nextCheckbox = this.checkboxes.toArray()[index + 1].checkbox.nativeElement;
      nextCheckbox.focus();
    }
  }

  onCheckboxChange(label: string): void {
    if (label) {
      this.checkedLabels.add(label);
    } else {
      this.checkedLabels.delete(label);
    }
    this.label = Array.from(this.checkedLabels).join(', ');
  }

  uncheckAllCheckboxes(): void {
    this.checkboxes.forEach(checkbox => {
      checkbox.checked = false; // Uncheck the checkbox
      checkbox.checkboxChanged.emit(''); // Emit event to update parent component state
    });
    this.checkedLabels.clear(); // Clear the checked labels set
    this.label = ''; // Reset the label
  }

  downloadTextFile(): void {
    const textContent = this.label;
    const blob = new Blob([textContent], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = this.images[this.currentImageIndex]?.name.slice(0, -4)+'.txt';
    a.click();
    URL.revokeObjectURL(url);
  }
}
