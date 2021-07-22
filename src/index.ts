import './style.scss';
import {Model} from './model/model';
import {View} from './view/view';
import {Presenter} from './presenter/presenter';

let sliders = document.querySelectorAll('.js-range-slider');
for (let slider of sliders) {
  let model: Model = new Model({
    // min: 10,
    // max: 150,
    // leftValue: -100,
    // rightValue: -50,
    range: true
  });
  
  let view = new View(slider, {
    minMaxLabels: true,
    valueLabel: true,
    // vertical: true,
    range: true,
    // scale: true,
    // scaleIntervals: 5
  });
  
  let presenter = new Presenter(model, view);
  
  view.registerWith(presenter);
}