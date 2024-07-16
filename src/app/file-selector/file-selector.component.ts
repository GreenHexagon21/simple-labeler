import { Component, QueryList, ViewChildren, ElementRef } from '@angular/core';
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

  @ViewChildren('app-image-checkbox') checkboxes: QueryList<ElementRef>;

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

  imageStep(amount) {
    console.log(this.data);
    this.currentImageIndex += amount;
  }

  findImage(exampleImage: string): string {
    const foundImage = this.images.find(image => image.name === exampleImage);
    return foundImage ? foundImage.url : '';
  }

  focusPreviousCheckbox(index: number): void {
    if (index > 0) {
      const previousCheckbox = this.checkboxes.toArray()[index - 1].nativeElement.querySelector('input');
      previousCheckbox.focus();
    }
  }

  focusNextCheckbox(index: number): void {
    if (index < this.checkboxes.length - 1) {
      const nextCheckbox = this.checkboxes.toArray()[index + 1].nativeElement.querySelector('input');
      nextCheckbox.focus();
    }
  }
}
