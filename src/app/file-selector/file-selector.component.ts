import { Component } from '@angular/core';
import { groups } from '../res/json/tags.json';

@Component({
  selector: 'app-file-selector',
  templateUrl: './file-selector.component.html',
  styleUrls: ['./file-selector.component.scss']
})
export class FileSelectorComponent {
  images: string[] = [];
  items = [
    { name: 'Item 1', checked: false },
    { name: 'Item 2', checked: true },
    { name: 'Item 3', checked: false }
  ];


  currentImageIndex = 0;
  data: any = groups
  selectedTag: any;

  onFolderSelect(event: any): void {
    const files = Array.from(event.target.files) as File[];
    this.images = [];

    files.forEach(file => {
      if (file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onload = (e: any) => {
          this.images.push(e.target.result);
        };
        reader.readAsDataURL(file);
      }
    });
  }
  imageStep(amount) {
    console.log(this.data);
    this.currentImageIndex += amount;
  }
}
