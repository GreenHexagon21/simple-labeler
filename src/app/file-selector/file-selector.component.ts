import { Component, QueryList, ViewChildren, ElementRef, HostListener } from '@angular/core';
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
  @ViewChildren('checkbox') checkboxes!: QueryList<ElementRef>;

  @ViewChildren('appImageCheckbox') checkboxesOld: QueryList<any>;

  onFolderSelect(event: any): void {
    const files = Array.from(event.target.files) as File[];
    const imageLoadPromises: Promise<{ name: string, url: string }>[] = [];
  
    files.forEach(file => {
      if (file.type.startsWith('image/')) {
        const promise = new Promise<{ name: string, url: string }>((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = (e: any) => {
            resolve({ name: file.name, url: e.target.result });
          };
          reader.onerror = (error) => reject(error);
          reader.readAsDataURL(file);
        });
        imageLoadPromises.push(promise);
      }
    });
  
    // Wait for all images to load
    Promise.all(imageLoadPromises)
      .then(images => {
        // Sort the images by name or any other attribute you want
        images.sort((a, b) => a.name.localeCompare(b.name));
  
        // Update the images array
        this.images = images;
      })
      .catch(error => {
        console.error("Error loading images:", error);
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

  onCheckboxChange(chekboxStatus: any): void {
    if (chekboxStatus.checked) {
      this.checkedLabels.add(chekboxStatus.label);
      this.checkedLabels.add(chekboxStatus?.groupLabel);
    } else {
      this.checkedLabels.delete(chekboxStatus.label);
    }
    this.label = Array.from(this.checkedLabels).join(', ');
  }

  uncheckAllCheckboxes(): void {
    this.checkboxesOld.forEach(checkbox => {
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
