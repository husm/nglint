import { Directive, ElementRef, Renderer2 } from '@angular/core';

@Directive({
  selector: '[appChangeColor]'
})
export class ChangeColorDirective {
  constructor(elem: ElementRef, render: Renderer2) {
    // render.setStyle(elem.nativeElement, 'color', 'blue');
  }
}
