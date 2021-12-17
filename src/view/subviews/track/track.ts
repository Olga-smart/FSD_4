import createElement from '../../helpers/createElement';

class Track {
  view: any;

  component: HTMLElement;

  constructor() {
    this.view = null;
    this.component = createElement('div', 'range-slider__track');
    this.attachEventHandlers();
  }

  registerWith(view: any) {
    this.view = view;
  }

  getOffsetWidth() {
    return this.component.offsetWidth;
  }

  getOffsetHeight() {
    return this.component.offsetHeight;
  }

  getBoundingClientRect() {
    return this.component.getBoundingClientRect();
  }

  append(...elements: HTMLElement[]) {
    this.component.append(...elements);
  }

  private handleClick(event: MouseEvent): void {
    const x: number = event.clientX - (event.currentTarget as Element).getBoundingClientRect().left;
    const y: number = event.clientY - (event.currentTarget as Element).getBoundingClientRect().top;
    this.view?.handleScaleOrTrackClick(x, y);
  }

  private attachEventHandlers() {
    this.component.addEventListener('click', this.handleClick.bind(this));
  }
}

export default Track;
