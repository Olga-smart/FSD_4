import Slider from './subviews/Slider/Slider';
import Track from './subviews/Track/Track';
import Range from './subviews/Range/Range';
import Thumb from './subviews/Thumb/Thumb';
import MinMaxLabel from './subviews/MinMaxLabel/MinMaxLabel';
import ValueLabel from './subviews/ValueLabel/ValueLabel';
import Scale from './subviews/Scale/Scale';
import LabelsContainer from './subviews/LabelsContainer/LabelsContainer';
import Label from './subviews/Label/Label';
import Input from './subviews/Input/Input';
import { Panel, PanelOptions } from './subviews/Panel/Panel';
import { EventManager } from '../EventManager/EventManager';

type ViewOptions = {
  minMaxLabels?: boolean,
  valueLabels?: boolean,
  vertical?: boolean,
  range?: boolean,
  scale?: boolean,
  scaleIntervals?: number,
  panel?: boolean
};

class View {
  component: Element;

  eventManager: EventManager;

  slider: Slider;

  track: Track;

  range: Range;

  input: Input;

  thumbLeft: Thumb;

  thumbRight?: Thumb;

  isRange: boolean;

  hasScale: boolean;

  scaleIntervals?: number;

  minLabel?: MinMaxLabel;

  maxLabel?: MinMaxLabel;

  valueLabelLeft?: ValueLabel;

  valueLabelRight?: ValueLabel;

  valueLabelCommon?: ValueLabel;

  vertical?: boolean;

  scale?: Scale;

  labelsContainer?: LabelsContainer;

  panel?: Panel;

  constructor(component: Element, options: ViewOptions = {}) {
    this.component = component;
    this.eventManager = new EventManager();

    this.slider = new Slider();
    this.track = new Track();
    this.track.registerWith(this);
    this.range = new Range();

    this.thumbLeft = new Thumb('left');
    this.thumbLeft.registerWith(this);

    this.input = new Input();

    if (options.range) {
      this.isRange = true;
      this.thumbRight = new Thumb('right');
      this.thumbRight.registerWith(this);
    } else {
      this.isRange = false;
    }

    if (options.scale) {
      this.hasScale = true;
      this.scaleIntervals = options.scaleIntervals ?? 4;
    } else {
      this.hasScale = false;
    }

    if (options.minMaxLabels || options.valueLabels) {
      this.labelsContainer = new LabelsContainer();

      if (options.minMaxLabels) {
        this.minLabel = new MinMaxLabel('left');
        this.maxLabel = new MinMaxLabel('right');
      }

      if (options.valueLabels) {
        this.valueLabelLeft = new ValueLabel('left');

        if (options.range) {
          this.valueLabelRight = new ValueLabel('right');
          this.valueLabelCommon = new ValueLabel('common');
        }
      }
    }

    if (options.vertical) {
      this.vertical = true;
    }

    if (options.panel) {
      this.panel = new Panel();
    }

    this.render();
  }

  setMinValue(min: number): void {
    if (this.minLabel) {
      this.minLabel.setValue(min);
    }
  }

  setMaxValue(max: number): void {
    if (this.maxLabel) {
      this.maxLabel.setValue(max);
    }
  }

  setLeftValue(value: number, percent: number): void {
    if (!this.vertical) {
      this.thumbLeft.setLeftIndent(percent);

      if (!this.isRange) {
        this.range.setWidth(percent);
      }

      if (this.isRange) {
        this.range.setLeftIndent(percent);
      }

      if (this.valueLabelLeft) {
        this.valueLabelLeft.setLeftIndent(this.thumbLeft.getLeftIndent());
      }

      if (this.thumbLeft.getLeftIndent() === '100%') {
        this.thumbLeft.setZIndex(100);
      } else {
        this.thumbLeft.setZIndex(3);
      }
    }

    if (this.vertical) {
      this.thumbLeft.setTopIndent(100 - percent);

      if (!this.isRange) {
        this.range.setHeight(percent);
      }

      if (this.isRange) {
        this.range.setBottomIndent(percent);
      }

      if (this.valueLabelLeft) {
        this.valueLabelLeft.setTopIndent(this.thumbLeft.getTopIndent());
      }

      if (this.thumbLeft.getTopIndent() === '0%') {
        this.thumbLeft.setZIndex(100);
      } else {
        this.thumbLeft.setZIndex(3);
      }
    }

    if (this.valueLabelLeft) {
      this.valueLabelLeft.setValue(value);

      if (this.isRange) {
        this.valueLabelCommon!.setValue(`${value} - ${this.valueLabelRight!.getValue()}`);

        if (this.isTwoValueLabelsClose()) {
          this.mergeLabels();
        } else {
          this.splitLabels();
        }
      }
    }

    if (this.valueLabelLeft && this.minLabel) {
      if (this.isLeftValueLabelCloseToMinLabel()) {
        this.minLabel.setOpacity(0);
      } else {
        this.minLabel.setOpacity(1);
      }

      if (!this.isRange) {
        if (this.isLeftValueLabelCloseToMaxLabel()) {
          this.maxLabel!.setOpacity(0);
        } else {
          this.maxLabel!.setOpacity(1);
        }
      }
    }
  }

  setRightValue(value: number, percent: number): void {
    if (!this.vertical) {
      this.thumbRight?.setLeftIndent(percent);
      this.range.setRightIndent(100 - percent);

      if (this.valueLabelRight) {
        this.valueLabelRight.setLeftIndent(this.thumbRight!.getLeftIndent());
      }
    }

    if (this.vertical) {
      this.thumbRight?.setTopIndent(100 - percent);
      this.range.setTopIndent(100 - percent);

      if (this.valueLabelRight) {
        this.valueLabelRight.setTopIndent(this.thumbRight!.getTopIndent());
      }
    }

    if (this.valueLabelRight) {
      this.valueLabelRight.setValue(value);
      this.valueLabelCommon!.setValue(`${this.valueLabelLeft!.getValue()} - ${value}`);

      if (this.isTwoValueLabelsClose()) {
        this.mergeLabels();
      } else {
        this.splitLabels();
      }
    }

    if (this.valueLabelRight && this.maxLabel) {
      if (this.isRightValueLabelCloseToMaxLabel()) {
        this.maxLabel.setOpacity(0);
      } else {
        this.maxLabel.setOpacity(1);
      }
    }
  }

  updateInput(value1: number, value2: number | null = null): void {
    this.input.setValue(value1, value2);
  }

  handleLeftInput(clientX: number, clientY: number, shiftX: number = 0, shiftY: number = 0): void {
    if (!this.vertical) {
      const trackShift = this.track.getBoundingClientRect().left;
      let newLeft = clientX - shiftX - trackShift;

      if (newLeft < 0) {
        newLeft = 0;
      }

      if (!this.isRange) {
        const trackWidth = this.track.getOffsetWidth();

        if (newLeft > trackWidth) {
          newLeft = trackWidth;
        }
      }

      if (this.isRange) {
        const rightThumbShift = this.thumbRight!.getBoundingClientRect().left;
        const rightThumbPosition = rightThumbShift + this.thumbRight!.getWidth() / 2 - trackShift;

        if (newLeft > rightThumbPosition) {
          newLeft = rightThumbPosition;
        }
      }

      this.eventManager.notify('viewLeftInput', newLeft);
    }

    if (this.vertical) {
      const trackShift = this.track.getBoundingClientRect().top;
      let newTop = clientY - shiftY - trackShift;

      const trackHeight = this.track.getOffsetHeight();
      if (newTop > trackHeight) {
        newTop = trackHeight;
      }

      if (!this.isRange) {
        if (newTop < 0) {
          newTop = 0;
        }
      }

      if (this.isRange) {
        const rightThumbShift = this.thumbRight!.getBoundingClientRect().top;
        const rightThumbPosition = rightThumbShift + this.thumbRight!.getHeight() / 2 - trackShift;

        if (newTop < rightThumbPosition) {
          newTop = rightThumbPosition;
        }
      }

      const newBottom = trackHeight - newTop;

      this.eventManager.notify('viewLeftInput', newBottom);
    }
  }

  handleRightInput(clientX: number, clientY: number, shiftX: number = 0, shiftY: number = 0): void {
    if (!this.vertical) {
      const trackShift = this.track.getBoundingClientRect().left;
      let newLeft = clientX - shiftX - trackShift;

      const leftThumbShift = this.thumbLeft.getBoundingClientRect().left;
      const leftThumbPosition = leftThumbShift + this.thumbLeft.getWidth() / 2 - trackShift;

      if (newLeft < leftThumbPosition) {
        newLeft = leftThumbPosition;
      }

      const trackWidth = this.track.getOffsetWidth();

      if (newLeft > trackWidth) {
        newLeft = trackWidth;
      }

      this.eventManager.notify('viewRightInput', newLeft);
    }

    if (this.vertical) {
      const trackShift = this.track.getBoundingClientRect().top;
      let newTop = clientY - shiftY - trackShift;

      if (newTop < 0) {
        newTop = 0;
      }

      const leftThumbShift = this.thumbLeft.getBoundingClientRect().top;
      const leftThumbPosition = leftThumbShift + this.thumbLeft.getHeight() / 2 - trackShift;

      if (newTop > leftThumbPosition) {
        newTop = leftThumbPosition;
      }

      const newBottom = this.track.getOffsetHeight() - newTop;

      this.eventManager.notify('viewRightInput', newBottom);
    }
  }

  addScale(min: number, max: number, intervalsNumber: number): void {
    this.scale = new Scale(min, max, intervalsNumber);
    this.scale.registerWith(this);
    this.slider.after(this.scale.component);

    if (!this.vertical) {
      this.scale.fitHeightForHorizontal();
    }

    if (this.vertical) {
      this.scale.fitWidthForVertical();
    }

    this.hasScale = true;
  }

  removeScale(): void {
    this.scale?.component.remove();
    this.hasScale = false;
  }

  handleScaleOrTrackClick(x: number, y: number): void {
    if (!this.isRange) {
      this.addSmoothTransition('left');

      if (!this.vertical) {
        this.eventManager.notify('viewLeftInput', x);
      } else {
        this.eventManager.notify('viewLeftInput', this.track.getOffsetHeight() - y);
      }

      setTimeout(() => {
        this.removeSmoothTransition('left');
      }, 1000);
    }

    if (this.isRange) {
      if (this.whichThumbIsNearer(x, y) === 'left') {
        this.addSmoothTransition('left');

        if (!this.vertical) {
          this.eventManager.notify('viewLeftInput', x);
        } else {
          this.eventManager.notify('viewLeftInput', this.track.getOffsetHeight() - y);
        }

        setTimeout(() => {
          this.removeSmoothTransition('left');
        }, 1000);
      } else {
        this.addSmoothTransition('right');

        if (!this.vertical) {
          this.eventManager.notify('viewRightInput', x);
        } else {
          this.eventManager.notify('viewRightInput', this.track.getOffsetHeight() - y);
        }

        setTimeout(() => {
          this.removeSmoothTransition('right');
        }, 1000);
      }
    }
  }

  fixLabelsContainerWidthForVertical(): void {
    const labels: Label[] = this.collectLabels();
    this.labelsContainer?.fixWidthForVertical(labels);
  }

  fixLabelsContainerHeightForHorizontal(): void {
    const labels: Label[] = this.collectLabels();
    this.labelsContainer?.fixHeightForHorizontal(labels);
  }

  setPanelValues(options: PanelOptions): void {
    this.panel?.setValues(options);
  }

  updatePanelFrom(value: number): void {
    this.panel?.updateFrom(value);
  }

  updatePanelTo(value: number | ''): void {
    this.panel?.updateTo(value);
  }

  updatePanelScaleIntervals(value: number | ''): void {
    this.panel?.updateScaleIntervals(value);
  }

  updatePanelStep(value: number): void {
    this.panel?.updateStep(value);
  }

  changeLeftValueFromOutside(value: number): void {
    this.eventManager.notify('viewChangeLeftValueFromOutside', value);
  }

  changeRightValueFromOutside(value: number): void {
    this.eventManager.notify('viewChangeRightValueFromOutside', value);
  }

  changeMinFromOutside(value: number): void {
    this.eventManager.notify('viewChangeMinFromOutside', value);
  }

  changeMaxFromOutside(value: number): void {
    this.eventManager.notify('viewChangeMaxFromOutside', value);
  }

  changeStepFromOutside(value: number): void {
    this.eventManager.notify('viewChangeStepFromOutside', value);
  }

  changeOrientationFromOutside(): void {
    if (!this.vertical) {
      this.vertical = true;
      this.destroy();
      this.render();
      this.thumbLeft.setLeftIndent(0);
      this.thumbRight?.setLeftIndent(0);
      this.range.setLeftIndent(0);
      this.range.setRightIndent(0);
      this.range.resetTopIndent();
      this.range.resetWidth();
      this.valueLabelLeft?.setLeftIndent('unset');
      this.valueLabelRight?.setLeftIndent('unset');
      this.valueLabelCommon?.setLeftIndent('unset');
      this.scale?.handleSwitchFromHorizontalToVertical();
      this.eventManager.notify('viewChangeOrientationFromOutside');
      return;
    }

    if (this.vertical) {
      this.vertical = false;
      this.component.classList.remove('range-slider_vertical');
      this.destroy();
      this.render();
      this.thumbLeft.setTopIndent(0);
      this.thumbRight?.setTopIndent(0);
      this.range.setBottomIndent(0);
      this.range.setTopIndent(0);
      this.range.resetHeight();
      this.valueLabelLeft?.setTopIndent('unset');
      this.valueLabelRight?.setTopIndent('unset');
      this.valueLabelCommon?.setTopIndent('unset');
      this.scale?.handleSwitchFromVerticalToHorizontal();
      this.eventManager.notify('viewChangeOrientationFromOutside');
    }
  }

  toggleRangeFromOutside(): void {
    this.isRange = !this.isRange;

    if (this.isRange) {
      this.destroy();
      this.thumbRight = new Thumb('right');
      this.thumbRight.registerWith(this);
      if (this.valueLabelLeft) {
        this.valueLabelRight = new ValueLabel('right');
        this.valueLabelCommon = new ValueLabel('common');
      }
      if (!this.vertical) {
        this.range.resetWidth();
      }
      if (this.vertical) {
        this.range.resetHeight();
      }
      this.render();
    }

    if (!this.isRange) {
      if (this.vertical) {
        this.range.resetTopIndent();
      }
      this.destroy();
      this.render();
    }

    this.eventManager.notify('viewToggleRangeFromOutside');
  }

  toggleScaleFromOutside(): void {
    this.hasScale = !this.hasScale;
    this.eventManager.notify('viewToggleScaleFromOutside');
  }

  changeScaleIntervals(value: number): void {
    if (value <= 0) return;

    this.scaleIntervals = Math.floor(value);
    this.removeScale();
    this.eventManager.notify('viewChangeScaleIntervals');
  }

  toggleValueLabels(): void {
    if (this.valueLabelLeft) {
      this.valueLabelLeft.component.remove();
      this.valueLabelRight?.component?.remove();
      this.valueLabelCommon?.component?.remove();

      this.valueLabelLeft = undefined;
      this.valueLabelRight = undefined;
      this.valueLabelCommon = undefined;

      if (this.minLabel) {
        if (!this.vertical) {
          this.fixLabelsContainerHeightForHorizontal();
        }

        if (this.vertical) {
          this.fixLabelsContainerWidthForVertical();
        }
      }

      if (!this.minLabel) {
        this.labelsContainer?.component.remove();
        this.labelsContainer = undefined;
      }

      return;
    }

    if (!this.valueLabelLeft) {
      this.valueLabelLeft = new ValueLabel('left');

      if (this.isRange) {
        this.valueLabelRight = new ValueLabel('right');
        this.valueLabelCommon = new ValueLabel('common');
      }

      if (!this.labelsContainer) {
        this.labelsContainer = new LabelsContainer();
        this.slider.before(this.labelsContainer.component);
      }

      this.labelsContainer.append(this.valueLabelLeft.component);

      if (this.isRange) {
        this.labelsContainer
          .append(this.valueLabelRight!.component, this.valueLabelCommon!.component);
      }

      this.eventManager.notify('viewAddValueLabels');

      if (!this.vertical) {
        this.fixLabelsContainerHeightForHorizontal();
      }

      if (this.vertical) {
        this.fixLabelsContainerWidthForVertical();
      }
    }
  }

  toggleMinMaxLabels(): void {
    if (this.minLabel) {
      this.minLabel.component.remove();
      this.maxLabel?.component.remove();

      this.minLabel = undefined;
      this.maxLabel = undefined;

      if (this.valueLabelLeft) {
        if (!this.vertical) {
          this.fixLabelsContainerHeightForHorizontal();
        }

        if (this.vertical) {
          this.fixLabelsContainerWidthForVertical();
        }
      }

      if (!this.valueLabelLeft) {
        this.labelsContainer?.component.remove();
        this.labelsContainer = undefined;
      }

      return;
    }

    if (!this.minLabel) {
      this.minLabel = new MinMaxLabel('left');
      this.maxLabel = new MinMaxLabel('right');

      if (!this.labelsContainer) {
        this.labelsContainer = new LabelsContainer();
        this.slider.before(this.labelsContainer.component);
      }

      this.labelsContainer.append(this.minLabel.component, this.maxLabel.component);

      this.eventManager.notify('viewAddMinMaxLabels');

      if (!this.vertical) {
        this.fixLabelsContainerHeightForHorizontal();
      }

      if (this.vertical) {
        this.fixLabelsContainerWidthForVertical();
      }
    }
  }

  hasLabels(): boolean {
    if (this.valueLabelLeft || this.minLabel) {
      return true;
    }
    return false;
  }

  private render(): void {
    this.track.append(this.range.component);
    this.slider.append(this.track.component, this.thumbLeft.component);
    this.component.append(this.slider.component, this.input.component);

    if (this.isRange) {
      this.slider.append(this.thumbRight!.component);
    } else {
      if (!this.vertical) {
        this.range.setLeftIndent(0);
      }
      if (this.vertical) {
        this.range.setBottomIndent(0);
      }
    }

    if (this.minLabel && this.maxLabel) {
      this.labelsContainer!.append(this.minLabel.component, this.maxLabel.component);
    }

    if (this.valueLabelLeft) {
      this.labelsContainer!.append(this.valueLabelLeft.component);

      if (this.isRange) {
        this.labelsContainer!
          .append(this.valueLabelRight!.component, this.valueLabelCommon!.component);
      }
    }

    if (this.labelsContainer) {
      this.slider.before(this.labelsContainer.component);
    }

    if (this.vertical) {
      this.component.classList.add('range-slider_vertical');
    }

    if (this.panel) {
      this.component.append(this.panel.component);
    }

    if (this.scale) {
      this.slider.after(this.scale.component);
    }
  }

  private destroy(): void {
    if (this.labelsContainer) {
      [...this.labelsContainer.component.children].forEach((element) => {
        element.remove();
      });
    }

    [...this.slider.component.children].forEach((element) => {
      element.remove();
    });

    [...this.component.children].forEach((element) => {
      element.remove();
    });
  }

  private mergeLabels(): void {
    this.valueLabelLeft?.setOpacity(0);
    this.valueLabelRight?.setOpacity(0);
    this.valueLabelCommon?.setOpacity(1);

    if (!this.vertical) {
      const distanceBetweenThumbs = (
        parseInt(this.thumbRight!.getLeftIndent(), 10)
        - parseInt(this.thumbLeft.getLeftIndent(), 10)
      );
      this.valueLabelCommon?.setLeftIndent(`${parseInt(this.valueLabelLeft!.getLeftIndent(), 10) + distanceBetweenThumbs / 2}%`);
    }

    if (this.vertical) {
      const distanceBetweenThumbs = (
        parseInt(this.thumbRight!.getTopIndent(), 10) - parseInt(this.thumbLeft.getTopIndent(), 10)
      );
      this.valueLabelCommon?.setTopIndent(`${parseInt(this.valueLabelRight!.getTopIndent(), 10) - distanceBetweenThumbs / 2}%`);
    }
  }

  private splitLabels(): void {
    this.valueLabelCommon?.setOpacity(0);
    this.valueLabelLeft?.setOpacity(1);
    this.valueLabelRight?.setOpacity(1);
  }

  private isTwoValueLabelsClose(): boolean | undefined {
    if (this.vertical) {
      const bottomLabelEdge = this.valueLabelLeft!.getBoundingClientRect().top;
      const topLabelEdge = this.valueLabelRight!.getBoundingClientRect().bottom;

      return ((bottomLabelEdge - topLabelEdge) < 3);
    }

    const leftLabelEdge = this.valueLabelLeft!.getBoundingClientRect().right;
    const rightLabelEdge = this.valueLabelRight!.getBoundingClientRect().left;

    return ((rightLabelEdge - leftLabelEdge) < 3);
  }

  private isLeftValueLabelCloseToMinLabel(): boolean | undefined {
    let leftLabelEdge;
    let minLabelEdge;

    if (this.vertical) {
      leftLabelEdge = this.valueLabelLeft!.getBoundingClientRect().bottom;
      minLabelEdge = this.minLabel!.getBoundingClientRect().top;

      return ((minLabelEdge - leftLabelEdge) < 3);
    }

    leftLabelEdge = this.valueLabelLeft!.getBoundingClientRect().left;
    minLabelEdge = this.minLabel!.getBoundingClientRect().right;

    return ((leftLabelEdge - minLabelEdge) < 3);
  }

  private isLeftValueLabelCloseToMaxLabel(): boolean | undefined {
    let leftLabelEdge;
    let maxLabelEdge;

    if (this.vertical) {
      leftLabelEdge = this.valueLabelLeft!.getBoundingClientRect().top;
      maxLabelEdge = this.maxLabel!.getBoundingClientRect().bottom;

      return ((leftLabelEdge - maxLabelEdge) < 3);
    }

    leftLabelEdge = this.valueLabelLeft!.getBoundingClientRect().right;
    maxLabelEdge = this.maxLabel!.getBoundingClientRect().left;

    return ((maxLabelEdge - leftLabelEdge) < 3);
  }

  private isRightValueLabelCloseToMaxLabel(): boolean | undefined {
    let rightLabelEdge;
    let maxLabelEdge;

    if (this.vertical) {
      rightLabelEdge = this.valueLabelRight!.getBoundingClientRect().top;
      maxLabelEdge = this.maxLabel!.getBoundingClientRect().bottom;

      return ((rightLabelEdge - maxLabelEdge) < 3);
    }

    rightLabelEdge = this.valueLabelRight!.getBoundingClientRect().right;
    maxLabelEdge = this.maxLabel!.getBoundingClientRect().left;

    return ((maxLabelEdge - rightLabelEdge) < 3);
  }

  private whichThumbIsNearer(x: number, y: number): 'left' | 'right' {
    const leftThumbCoords = this.thumbLeft.getBoundingClientRect();
    const rightThumbCoords = this.thumbRight!.getBoundingClientRect();
    const trackCoords = this.track.getBoundingClientRect();

    let distanceFromLeftThumbCenter: number = 0;
    let distanceFromRightThumbCenter: number = 0;

    if (!this.vertical) {
      const leftThumbCenter = leftThumbCoords.left + leftThumbCoords.width / 2 - trackCoords.left;
      const rightThumbCenter = rightThumbCoords.left
        + rightThumbCoords.width / 2
        - trackCoords.left;

      distanceFromLeftThumbCenter = Math.abs(x - leftThumbCenter);
      distanceFromRightThumbCenter = Math.abs(x - rightThumbCenter);
    }

    if (this.vertical) {
      const leftThumbCenter = leftThumbCoords.top + leftThumbCoords.height / 2 - trackCoords.top;
      const rightThumbCenter = rightThumbCoords.top + rightThumbCoords.height / 2 - trackCoords.top;

      distanceFromLeftThumbCenter = Math.abs(y - leftThumbCenter);
      distanceFromRightThumbCenter = Math.abs(y - rightThumbCenter);
    }

    if (distanceFromLeftThumbCenter <= distanceFromRightThumbCenter) {
      return 'left';
    }
    return 'right';
  }

  private addSmoothTransition(side: 'left' | 'right' = 'left'): void {
    if (side === 'left') {
      this.thumbLeft.component.classList.add('range-slider__thumb_smooth-transition');
      this.range.component.classList.add('range-slider__range_smooth-transition');
      if (this.valueLabelLeft) {
        this.valueLabelLeft.component.classList.add('range-slider__value-label_smooth-transition');
      }
    }

    if (side === 'right') {
      this.thumbRight!.component.classList.add('range-slider__thumb_smooth-transition');
      this.range.component.classList.add('range-slider__range_smooth-transition');
      if (this.valueLabelRight) {
        this.valueLabelRight.component.classList.add('range-slider__value-label_smooth-transition');
      }
    }
  }

  private removeSmoothTransition(side: 'left' | 'right' = 'left'): void {
    if (side === 'left') {
      this.thumbLeft.component.classList.remove('range-slider__thumb_smooth-transition');
      this.range.component.classList.remove('range-slider__range_smooth-transition');
      if (this.valueLabelLeft) {
        this.valueLabelLeft.component.classList.remove('range-slider__value-label_smooth-transition');
      }
    }

    if (side === 'right') {
      this.thumbRight!.component.classList.remove('range-slider__thumb_smooth-transition');
      this.range.component.classList.remove('range-slider__range_smooth-transition');
      if (this.valueLabelRight) {
        this.valueLabelRight.component.classList.remove('range-slider__value-label_smooth-transition');
      }
    }
  }

  private collectLabels(): Label[] {
    const labels: Label[] = [];

    if (this.minLabel && this.maxLabel) {
      labels.push(this.minLabel);
      labels.push(this.maxLabel);
    }

    if (this.valueLabelLeft) {
      labels.push(this.valueLabelLeft);
    }

    if (this.valueLabelRight) {
      labels.push(this.valueLabelRight);
    }

    return labels;
  }
}

export default View;
