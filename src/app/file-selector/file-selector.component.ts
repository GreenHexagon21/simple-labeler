import { Component, QueryList, ViewChildren, ElementRef, AfterViewInit, HostListener } from '@angular/core';
import { groups } from '../res/json/tags.json';

@Component({
  selector: 'app-file-selector',
  templateUrl: './file-selector.component.html',
  styleUrls: ['./file-selector.component.scss']
})
export class FileSelectorComponent {
  images: { name: string, url: string }[] = [];
  currentImageIndex = 0;
  data: any = groups;
  label: string = '';
  checkedLabels: Set<string> = new Set();

  @ViewChildren('appImageCheckbox') checkboxes: QueryList<any>;

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

  onCheckboxChange(chekboxStatus:any): void {
    if (chekboxStatus.checked) {
      this.checkedLabels.add(chekboxStatus.label)
      this.checkedLabels.add(chekboxStatus?.groupLabel);
    } else {
      this.checkedLabels.delete(chekboxStatus.label);
    }
    this.label = Array.from(this.checkedLabels).join(', ');
  }

  uncheckAllCheckboxes(): void {
    this.checkboxes.forEach(checkbox => {
      checkbox.checked = false; 
      checkbox.checkboxChanged.emit(''); 
    });
    this.checkedLabels.clear(); 
    this.label = ''; 
  }

  downloadTextFile(): void {
    const textContent = this.label;
    const blob = new Blob([textContent], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = this.images[this.currentImageIndex]?.name.slice(0, -4) + '.txt';
    a.click();
    URL.revokeObjectURL(url);
  }

  @HostListener('window:keydown', ['$event'])
  handleKeydown(event: KeyboardEvent): void {
    switch (event.key) {
      case 'ArrowLeft':
        this.imageStep(-1);
        event.preventDefault();
        break;
      case 'ArrowRight':
        this.imageStep(1);
        event.preventDefault();
        break;
    }
  }
}
