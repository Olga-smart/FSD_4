import Model from '../model/model';
import View from '../view/view';
import { IEventListener } from '../eventManager/eventManager';
export default class Presenter implements IEventListener {
    model: Model;
    view: View;
    constructor(model: Model, view: View);
    inform(eventType: string, data: any): void;
    hasViewLabels(): boolean;
    handleLeftInput(px: number): void;
    handleRightInput(px: number): void;
    passLeftValueToView(value: number): void;
    passRightValueToView(value: number): void;
    convertValueToPx(value: number): number;
    convertPxToValue(px: number): number;
    fitToStep(value: number): number;
    static removeCalcInaccuracy(value: number): number;
    changeLeftValueFromOutside(value: number): void;
    changeRightValueFromOutside(value: number): void;
    changeMinFromOutside(value: number): void;
    changeMaxFromOutside(value: number): void;
    changeStepFromOutside(value: number): void;
    handleViewOrientationChange(): void;
    handleRangeToggle(): void;
    handleScaleToggle(): void;
    handleChangeScaleIntervals(): void;
    handleAddValueLabels(): void;
    handleAddMinMaxLabels(): void;
}
//# sourceMappingURL=presenter.d.ts.map