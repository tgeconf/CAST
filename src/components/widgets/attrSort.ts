import '../../assets/style/attrSort.scss'
import { TSortDataAttr } from '../../app/ds'
import { state, State } from '../../app/state'
import Reducer from '../../app/reducer';
import * as action from '../../app/action';

export default class AttrSort {
    static ASSCENDING_ORDER: string = 'asscending';
    static DESCENDING_ORDER: string = 'descending';
    static INDEX_ORDER: string = 'dataIndex';
    selectInput: HTMLSpanElement;

    public createAttrSort(attrName: string) {
        this.selectInput = document.createElement('span');
        this.selectInput.className = 'attr-sort';
        const select: HTMLSelectElement = document.createElement('select');
        select.name = attrName;
        [AttrSort.INDEX_ORDER, AttrSort.ASSCENDING_ORDER, AttrSort.DESCENDING_ORDER].forEach(order => {
            const option: HTMLOptionElement = document.createElement('option');
            option.innerText = order;
            option.value = order;
            select.appendChild(option);
        })
        select.onchange = () => {
            let sortDataAttrArr: TSortDataAttr[] = [];
            state.sortDataAttrs.forEach(sda => {
                if (sda.attr === select.name) {
                    sortDataAttrArr.push({
                        attr: select.name,
                        sort: select.value
                    })
                } else {
                    sortDataAttrArr.push(sda);
                }
            })
            //save histroy before update state
            State.tmpStateBusket.push([action.UPDATE_DATA_SORT, state.sortDataAttrs]);
            State.saveHistory();
            Reducer.triger(action.UPDATE_DATA_SORT, sortDataAttrArr);
        }
        this.selectInput.appendChild(select);
    }


}