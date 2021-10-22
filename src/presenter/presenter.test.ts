import Model from '../model/model';
import View from '../view/view';
import Presenter from './presenter';

describe('Presenter', () => {
  jest.mock('../model/model');
  jest.mock('../view/view');

  describe('constructor()', () => {
    const slider = document.createElement('div');
    const model = new Model();
    const view = new View(slider);
    const presenter = new Presenter(model, view);

    it('set up model', () => {
      expect(presenter.model).toBe(model);
    });

    it('set up view', () => {
      expect(presenter.view).toBe(view);
    });

    it('set min value for view', () => {
      view.setMinValue = jest.fn();
      const newPresenter = new Presenter(model, view);

      expect(newPresenter.view.setMinValue).toBeCalledWith(model.min);
    });

    it('set max value for view', () => {
      view.setMaxValue = jest.fn();
      const newPresenter = new Presenter(model, view);

      expect(newPresenter.view.setMaxValue).toBeCalledWith(model.max);
    });

    it('set left value for view', () => {
      jest.spyOn(Presenter.prototype, 'passLeftValueToView');
      const newPresenter = new Presenter(model, view);

      expect(newPresenter.passLeftValueToView).toBeCalledWith(model.leftValue);
    });

    it('set right value for view if range', () => {
      const newModel = new Model({
        range: true,
      });
      const newView = new View(slider, {
        range: true,
      });
      jest.spyOn(Presenter.prototype, 'passRightValueToView');
      const newPresenter = new Presenter(newModel, newView);

      expect(newPresenter.passRightValueToView).toBeCalledWith(newModel.rightValue);
    });

    it('add scale for view if it has scale', () => {
      const newModel = new Model();
      const newView = new View(slider, {
        scale: true,
      });
      newView.addScale = jest.fn();
      const newPresenter = new Presenter(newModel, newView);

      expect(newPresenter.view.addScale)
        .toBeCalledWith(newModel.min, newModel.max, newView.scaleIntervals);
    });

    describe('fix labels container height if slider is horizontal and has labels', () => {
      it('if slider has only value labels', () => {
        const newModel = new Model();
        const newView = new View(slider, {
          valueLabels: true,
        });
        newView.fixLabelsContainerHeightForHorizontal = jest.fn();
        const newPresenter = new Presenter(newModel, newView);

        expect(newPresenter.view.fixLabelsContainerHeightForHorizontal).toBeCalled();
      });

      it('if slider has only min&max labels', () => {
        const newModel = new Model();
        const newView = new View(slider, {
          minMaxLabels: true,
        });
        newView.fixLabelsContainerHeightForHorizontal = jest.fn();
        const newPresenter = new Presenter(newModel, newView);

        expect(newPresenter.view.fixLabelsContainerHeightForHorizontal).toBeCalled();
      });

      it('if slider has both value and min&max labels', () => {
        const newModel = new Model();
        const newView = new View(slider, {
          valueLabels: true,
          minMaxLabels: true,
        });
        newView.fixLabelsContainerHeightForHorizontal = jest.fn();
        const newPresenter = new Presenter(newModel, newView);

        expect(newPresenter.view.fixLabelsContainerHeightForHorizontal).toBeCalled();
      });
    });

    describe('fix labels container width if slider is vertical and has labels', () => {
      it('if slider has only value labels', () => {
        const newModel = new Model();
        const newView = new View(slider, {
          vertical: true,
          valueLabels: true,
        });
        newView.fixLabelsContainerWidthForVertical = jest.fn();
        const newPresenter = new Presenter(newModel, newView);

        expect(newPresenter.view.fixLabelsContainerWidthForVertical).toBeCalled();
      });

      it('if slider has only min&max labels', () => {
        const newModel = new Model();
        const newView = new View(slider, {
          vertical: true,
          minMaxLabels: true,
        });
        newView.fixLabelsContainerWidthForVertical = jest.fn();
        const newPresenter = new Presenter(newModel, newView);

        expect(newPresenter.view.fixLabelsContainerWidthForVertical).toBeCalled();
      });

      it('if slider has both value and min&max labels', () => {
        const newModel = new Model();
        const newView = new View(slider, {
          vertical: true,
          valueLabels: true,
          minMaxLabels: true,
        });
        newView.fixLabelsContainerWidthForVertical = jest.fn();
        const newPresenter = new Presenter(newModel, newView);

        expect(newPresenter.view.fixLabelsContainerWidthForVertical).toBeCalled();
      });
    });
  });

  describe('handleViewLeftInput(px)', () => {
    const slider = document.createElement('div');
    const model = new Model();
    const view = new View(slider);
    const presenter = new Presenter(model, view);

    presenter.convertPxToValue = jest.fn();
    presenter.convertValueToPx = jest.fn();
    model.setLeftValue = jest.fn();
    view.setLeftValue = jest.fn();

    it('convert px to value', () => {
      for (let i = 0; i <= 100; i += 1) {
        presenter.handleViewLeftInput(i);
        expect(presenter.convertPxToValue).toBeCalledWith(i);
      }
    });

    it('set left value for model', () => {
      for (let i = 0; i <= 100; i += 1) {
        presenter.handleViewLeftInput(i);
        expect(model.setLeftValue).toBeCalledWith(presenter.convertPxToValue(i));
      }
    });

    it('convert value to px after converting px to value', () => {
      for (let i = 0; i <= 100; i += 1) {
        presenter.handleViewLeftInput(i);
        expect(presenter.convertValueToPx).toBeCalledWith(presenter.convertPxToValue(i));
      }
    });

    it('set left value for view', () => {
      for (let i = 0; i <= 100; i += 1) {
        presenter.handleViewLeftInput(i);
        const value = presenter.convertPxToValue(i);
        const px = presenter.convertValueToPx(value);
        expect(view.setLeftValue).toBeCalledWith(value, px);
      }
    });
  });

  describe('handleViewRightInput(px)', () => {
    const slider = document.createElement('div');
    const model = new Model();
    const view = new View(slider);
    const presenter = new Presenter(model, view);

    presenter.convertPxToValue = jest.fn();
    presenter.convertValueToPx = jest.fn();
    model.setRightValue = jest.fn();
    view.setRightValue = jest.fn();

    it('convert px to value', () => {
      for (let i = 0; i <= 100; i += 1) {
        presenter.handleViewRightInput(i);
        expect(presenter.convertPxToValue).toBeCalledWith(i);
      }
    });

    it('set right value for model', () => {
      for (let i = 0; i <= 100; i += 1) {
        presenter.handleViewRightInput(i);
        expect(model.setRightValue).toBeCalledWith(presenter.convertPxToValue(i));
      }
    });

    it('convert value to px after converting px to value', () => {
      for (let i = 0; i <= 100; i += 1) {
        presenter.handleViewRightInput(i);
        expect(presenter.convertValueToPx).toBeCalledWith(presenter.convertPxToValue(i));
      }
    });

    it('set right value for view', () => {
      for (let i = 0; i <= 100; i += 1) {
        presenter.handleViewRightInput(i);
        const value = presenter.convertPxToValue(i);
        const px = presenter.convertValueToPx(value);
        expect(view.setRightValue).toBeCalledWith(value, px);
      }
    });
  });

  describe('passLeftValueToView(value)', () => {
    const slider = document.createElement('div');
    const model = new Model();
    const view = new View(slider);
    const presenter = new Presenter(model, view);

    presenter.convertValueToPx = jest.fn();
    view.setLeftValue = jest.fn();

    it('convert value to px', () => {
      for (let i = 0; i <= 100; i += 1) {
        presenter.passLeftValueToView(i);
        expect(presenter.convertValueToPx).toBeCalledWith(i);
      }
    });

    it('set left value for view', () => {
      for (let i = 0; i <= 100; i += 1) {
        presenter.passLeftValueToView(i);
        const px = presenter.convertValueToPx(i);
        expect(view.setLeftValue).toBeCalledWith(i, px);
      }
    });
  });

  describe('passRightValueToView(value)', () => {
    const slider = document.createElement('div');
    const model = new Model();
    const view = new View(slider);
    const presenter = new Presenter(model, view);

    presenter.convertValueToPx = jest.fn();
    view.setRightValue = jest.fn();

    it('convert value to px', () => {
      for (let i = 0; i <= 100; i += 1) {
        presenter.passRightValueToView(i);
        expect(presenter.convertValueToPx).toBeCalledWith(i);
      }
    });

    it('set left value for view', () => {
      for (let i = 0; i <= 100; i += 1) {
        presenter.passRightValueToView(i);
        const px = presenter.convertValueToPx(i);
        expect(view.setRightValue).toBeCalledWith(i, px);
      }
    });
  });

  describe('convertValueToPx(value)', () => {
    describe('if slider is horizontal', () => {
      const slider = document.createElement('div');
      const model = new Model();
      const view = new View(slider);
      const presenter = new Presenter(model, view);

      it('px match value if track length is 100 and min = 0 and max = 100', () => {
        model.min = 0;
        model.max = 100;
        view.track.getOffsetWidth = jest.fn();
        (view.track.getOffsetWidth as jest.Mock).mockReturnValue(100);

        for (let i = 0; i <= 100; i += 1) {
          expect(presenter.convertValueToPx(i)).toBeCloseTo(i);
        }
      });

      it('px match value / 2 if track length is 100 and min = 0 and max = 200', () => {
        model.min = 0;
        model.max = 200;
        view.track.getOffsetWidth = jest.fn();
        (view.track.getOffsetWidth as jest.Mock).mockReturnValue(100);

        for (let i = 0; i <= 100; i += 1) {
          expect(presenter.convertValueToPx(i)).toBeCloseTo(i / 2);
        }
      });

      it('px match value * 2 if track length is 200 and min = 0 and max = 100', () => {
        model.min = 0;
        model.max = 100;
        view.track.getOffsetWidth = jest.fn();
        (view.track.getOffsetWidth as jest.Mock).mockReturnValue(200);

        for (let i = 0; i <= 100; i += 1) {
          expect(presenter.convertValueToPx(i)).toBeCloseTo(i * 2);
        }
      });

      it('px match value / x if track length is 100 and min = 0 and max = 100 * x', () => {
        model.min = 0;
        view.track.getOffsetWidth = jest.fn();
        (view.track.getOffsetWidth as jest.Mock).mockReturnValue(100);

        for (let x = 1; x <= 10; x += 1) {
          model.max = 100 * x;
          for (let i = 0; i <= 100; i += 1) {
            expect(presenter.convertValueToPx(i)).toBeCloseTo(i / x);
          }
        }
      });

      it('px match value * x if track length is 100 * x and min = 0 and max = 100', () => {
        model.min = 0;
        model.max = 100;
        view.track.getOffsetWidth = jest.fn();

        for (let x = 1; x <= 10; x += 1) {
          (view.track.getOffsetWidth as jest.Mock).mockReturnValue(100 * x);
          for (let i = 0; i <= 100; i += 1) {
            expect(presenter.convertValueToPx(i)).toBeCloseTo(i * x);
          }
        }
      });
    });

    describe('if slider is vertical', () => {
      const slider = document.createElement('div');
      const model = new Model();
      const view = new View(slider, {
        vertical: true,
      });
      const presenter = new Presenter(model, view);

      it('px match value if track height is 100 and min = 0 and max = 100', () => {
        model.min = 0;
        model.max = 100;
        view.track.getOffsetHeight = jest.fn();
        (view.track.getOffsetHeight as jest.Mock).mockReturnValue(100);

        for (let i = 0; i <= 100; i += 1) {
          expect(presenter.convertValueToPx(i)).toBeCloseTo(i);
        }
      });

      it('px match value / 2 if track height is 100 and min = 0 and max = 200', () => {
        model.min = 0;
        model.max = 200;
        view.track.getOffsetHeight = jest.fn();
        (view.track.getOffsetHeight as jest.Mock).mockReturnValue(100);

        for (let i = 0; i <= 100; i += 1) {
          expect(presenter.convertValueToPx(i)).toBeCloseTo(i / 2);
        }
      });

      it('px match value * 2 if track height is 200 and min = 0 and max = 100', () => {
        model.min = 0;
        model.max = 100;
        view.track.getOffsetHeight = jest.fn();
        (view.track.getOffsetHeight as jest.Mock).mockReturnValue(200);

        for (let i = 0; i <= 100; i += 1) {
          expect(presenter.convertValueToPx(i)).toBeCloseTo(i * 2);
        }
      });

      it('px match value / x if track height is 100 and min = 0 and max = 100 * x', () => {
        model.min = 0;
        view.track.getOffsetHeight = jest.fn();
        (view.track.getOffsetHeight as jest.Mock).mockReturnValue(100);

        for (let x = 1; x <= 10; x += 1) {
          model.max = 100 * x;
          for (let i = 0; i <= 100; i += 1) {
            expect(presenter.convertValueToPx(i)).toBeCloseTo(i / x);
          }
        }
      });

      it('px match value * x if track height is 100 * x and min = 0 and max = 100', () => {
        model.min = 0;
        model.max = 100;
        view.track.getOffsetHeight = jest.fn();

        for (let x = 1; x <= 10; x += 1) {
          (view.track.getOffsetHeight as jest.Mock).mockReturnValue(100 * x);
          for (let i = 0; i <= 100; i += 1) {
            expect(presenter.convertValueToPx(i)).toBeCloseTo(i * x);
          }
        }
      });
    });
  });

  describe('convertPxToValue(value)', () => {
    describe('if slider is horizontal', () => {
      const slider = document.createElement('div');
      const model = new Model();
      const view = new View(slider);
      const presenter = new Presenter(model, view);

      it('value match px if track length is 100 and min = 0 and max = 100', () => {
        model.min = 0;
        model.max = 100;
        view.track.getOffsetWidth = jest.fn();
        (view.track.getOffsetWidth as jest.Mock).mockReturnValue(100);

        for (let i = 0; i <= 100; i += 1) {
          expect(presenter.convertPxToValue(i)).toBeCloseTo(i);
        }
      });

      it('value match px * 2 if track length is 100 and min = 0 and max = 200', () => {
        model.min = 0;
        model.max = 200;
        view.track.getOffsetWidth = jest.fn();
        (view.track.getOffsetWidth as jest.Mock).mockReturnValue(100);

        for (let i = 0; i <= 100; i += 1) {
          expect(presenter.convertPxToValue(i)).toBeCloseTo(i * 2);
        }
      });

      it('value match px / 2 if track length is 200 and min = 0 and max = 100', () => {
        model.min = 0;
        model.max = 100;
        view.track.getOffsetWidth = jest.fn();
        (view.track.getOffsetWidth as jest.Mock).mockReturnValue(200);
        const fitToStepOriginal = presenter.fitToStep;
        presenter.fitToStep = jest.fn();

        for (let i = 0; i <= 100; i += 1) {
          (presenter.fitToStep as jest.Mock).mockReturnValue(i / 2);
          expect(presenter.convertPxToValue(i)).toBeCloseTo(i / 2);
        }

        presenter.fitToStep = fitToStepOriginal;
      });

      it('value match px * x if track length is 100 and min = 0 and max = 100 * x', () => {
        model.min = 0;
        view.track.getOffsetWidth = jest.fn();
        (view.track.getOffsetWidth as jest.Mock).mockReturnValue(100);

        for (let x = 1; x <= 10; x += 1) {
          model.max = 100 * x;
          for (let i = 0; i <= 100; i += 1) {
            expect(presenter.convertPxToValue(i)).toBeCloseTo(i * x);
          }
        }
      });

      it('value match px / x if track length is 100 * x and min = 0 and max = 100', () => {
        model.min = 0;
        model.max = 100;
        view.track.getOffsetWidth = jest.fn();
        const fitToStepOriginal = presenter.fitToStep;
        presenter.fitToStep = jest.fn();

        for (let x = 1; x <= 10; x += 1) {
          (view.track.getOffsetWidth as jest.Mock).mockReturnValue(100 * x);
          for (let i = 0; i <= 100; i += 1) {
            (presenter.fitToStep as jest.Mock).mockReturnValue(i / x);
            expect(presenter.convertPxToValue(i)).toBeCloseTo(i / x);
          }
        }

        presenter.fitToStep = fitToStepOriginal;
      });
    });

    describe('if slider is vertical', () => {
      const slider = document.createElement('div');
      const model = new Model();
      const view = new View(slider, {
        vertical: true,
      });
      const presenter = new Presenter(model, view);

      it('value match px if track height is 100 and min = 0 and max = 100', () => {
        model.min = 0;
        model.max = 100;
        view.track.getOffsetHeight = jest.fn();
        (view.track.getOffsetHeight as jest.Mock).mockReturnValue(100);

        for (let i = 0; i <= 100; i += 1) {
          expect(presenter.convertPxToValue(i)).toBeCloseTo(i);
        }
      });

      it('value match px * 2 if track height is 100 and min = 0 and max = 200', () => {
        model.min = 0;
        model.max = 200;
        view.track.getOffsetHeight = jest.fn();
        (view.track.getOffsetHeight as jest.Mock).mockReturnValue(100);

        for (let i = 0; i <= 100; i += 1) {
          expect(presenter.convertPxToValue(i)).toBeCloseTo(i * 2);
        }
      });

      it('value match px / 2 if track height is 200 and min = 0 and max = 100', () => {
        model.min = 0;
        model.max = 100;
        view.track.getOffsetHeight = jest.fn();
        (view.track.getOffsetHeight as jest.Mock).mockReturnValue(200);
        const fitToStepOriginal = presenter.fitToStep;
        presenter.fitToStep = jest.fn();

        for (let i = 0; i <= 100; i += 1) {
          (presenter.fitToStep as jest.Mock).mockReturnValue(i / 2);
          expect(presenter.convertPxToValue(i)).toBeCloseTo(i / 2);
        }

        presenter.fitToStep = fitToStepOriginal;
      });

      it('value match px * x if track height is 100 and min = 0 and max = 100 * x', () => {
        model.min = 0;
        view.track.getOffsetHeight = jest.fn();
        (view.track.getOffsetHeight as jest.Mock).mockReturnValue(100);

        for (let x = 1; x <= 10; x += 1) {
          model.max = 100 * x;
          for (let i = 0; i <= 100; i += 1) {
            expect(presenter.convertPxToValue(i)).toBeCloseTo(i * x);
          }
        }
      });

      it('value match px / x if track height is 100 * x and min = 0 and max = 100', () => {
        model.min = 0;
        model.max = 100;
        view.track.getOffsetHeight = jest.fn();
        const fitToStepOriginal = presenter.fitToStep;
        presenter.fitToStep = jest.fn();

        for (let x = 1; x <= 10; x += 1) {
          (view.track.getOffsetHeight as jest.Mock).mockReturnValue(100 * x);
          for (let i = 0; i <= 100; i += 1) {
            (presenter.fitToStep as jest.Mock).mockReturnValue(i / x);
            expect(presenter.convertPxToValue(i)).toBeCloseTo(i / x);
          }
        }

        presenter.fitToStep = fitToStepOriginal;
      });
    });
  });

  describe('fitToStep(value)', () => {
    it('if step = x, result % x = 0', () => {
      for (let step = 1; step <= 100; step += 1) {
        const slider = document.createElement('div');
        const model = new Model({
          step,
        });
        const view = new View(slider);
        const presenter = new Presenter(model, view);

        for (let value = 0; value <= 100; value += 0.1) {
          expect(presenter.fitToStep(value) % step).toBe(0);
        }
      }
    });

    it('also works with fractional step', () => {
      for (let step = 0.1; step <= 0.9; step += 0.1) {
        const slider = document.createElement('div');
        const model = new Model({
          step,
        });
        const view = new View(slider);
        const presenter = new Presenter(model, view);

        for (let value = 0; value <= 100; value += 0.1) {
          expect(Math.floor(presenter.fitToStep(value) % step)).toBeCloseTo(0);
        }
      }
    });
  });
});
