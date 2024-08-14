import {
  Component,
  QueryList,
  ViewChildren,
  ElementRef,
  HostListener,
} from '@angular/core';
import { groups } from '../res/json/tags.json';
import { ImageCheckboxComponent } from '../image-checkbox/image-checkbox.component';

@Component({
  selector: 'app-file-selector',
  templateUrl: './file-selector.component.html',
  styleUrls: ['./file-selector.component.scss'],
})
export class FileSelectorComponent {
  images: { name: string; url: string }[] = [];
  currentImageIndex = 0;
  data: any = groups;
  label: string = '';
  checkedLabels: Set<string> = new Set();
  @ViewChildren('appImageCheckbox')
  checkboxes!: QueryList<ImageCheckboxComponent>;

  onFolderSelect(event: any): void {
    const files = Array.from(event.target.files) as File[];
    const imageLoadPromises: Promise<{ name: string; url: string }>[] = [];

    files.forEach((file) => {
      if (file.type.startsWith('image/')) {
        const promise = new Promise<{ name: string; url: string }>(
          (resolve, reject) => {
            const reader = new FileReader();
            reader.onload = (e: any) => {
              resolve({ name: file.name, url: e.target.result });
            };
            reader.onerror = (error) => reject(error);
            reader.readAsDataURL(file);
          }
        );
        imageLoadPromises.push(promise);
      }
    });

    // Wait for all images to load
    Promise.all(imageLoadPromises)
      .then((images) => {
        // Sort the images by name or any other attribute you want
        images.sort((a, b) => a.name.localeCompare(b.name));

        // Update the images array
        this.images = images;
      })
      .catch((error) => {
        console.error('Error loading images:', error);
      });
  }

  imageStep(amount: number): void {
    this.currentImageIndex += amount;
    if (amount > 0) {
      this.downloadTextFile();
    }
  }

  findImage(exampleImage: string): string {
    const foundImage = this.images.find((image) => image.name === exampleImage);
    return foundImage ? foundImage.url : '';
  }

  onCheckboxChange(checkboxStatus: any): void {
    if (checkboxStatus.checked) {
      if (checkboxStatus.label) {
        this.checkedLabels.add(checkboxStatus.label);
      }
      if (checkboxStatus.groupLabel) {
        this.checkedLabels.add(checkboxStatus.groupLabel);
      }
    } else {
      this.checkedLabels.delete(checkboxStatus.label);
    }
    this.label = Array.from(this.checkedLabels).join(', ');
  }

  uncheckAllCheckboxes(): void {
    this.checkboxes.forEach((checkbox) => {
      checkbox.checked = false; // Uncheck the checkbox
      checkbox.checkbox.nativeElement.checked = false; // Ensure the checkbox element is visually updated
    });
    this.checkedLabels.clear();
    this.label = '';
  }

  downloadTextFile(): void {
    if (
      this.images.length === 0 ||
      this.currentImageIndex < 0 ||
      this.currentImageIndex >= this.images.length
    ) {
      console.error('No image available or invalid index');
      return;
    }

    const textContent = this.label;
    const blob = new Blob([textContent], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);

    const baseName = this.images[this.currentImageIndex].name.replace(
      /\.[^/.]+$/,
      ''
    );
    const a = document.createElement('a');
    a.href = url;
    a.download = baseName + '.txt';
    a.click();

    URL.revokeObjectURL(url);
    this.uncheckAllCheckboxes();
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
