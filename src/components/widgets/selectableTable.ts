import '../../assets/style/selectableTable.scss'
import { state, State } from '../../app/state'
import { IDataItem, ISortDataAttr } from '../../app/core/ds';
import Reducer from '../../app/reducer';
import * as action from '../../app/action'
import AttrSort from './attrSort';

export default class SelectableTable {
    startRowIdx: string;
    selectedRows: string[];
    constructor() {
        this.startRowIdx = state.dataOrder[0];
        this.selectedRows = [];
    }

    public static renderSelection(selection: string[]) {
        Array.from(document.getElementsByClassName('selected-td')).forEach(std => {
            (<HTMLElement>std).classList.remove('selected-td');
        })
        selection.forEach(rowDataId => {
            const targetTr: HTMLElement = document.querySelector('[dataItem="' + rowDataId + '"]');
            if (targetTr) {
                Array.from(targetTr.children).forEach(td => {
                    td.classList.add('selected-td');
                })
            }
        })
    }

    public createTable(dt: Map<string, IDataItem>): HTMLTableElement {
        const dataTable: HTMLTableElement = document.createElement('table');
        dataTable.className = 'selectable-table';
        let count = 0;
        state.dataOrder.forEach(markId => {
            const dataItem = dt.get(markId);
            if (count === 0) {
                //create title
                const headerTr: HTMLTableRowElement = document.createElement('tr');
                ['markId', ...Object.keys(dataItem)].forEach(key => {
                    const th: HTMLTableHeaderCellElement = document.createElement('th');
                    const thContainer: HTMLDivElement = document.createElement('div');
                    thContainer.className = 'th-container';
                    const titleContent: HTMLParagraphElement = document.createElement('p');
                    titleContent.innerHTML = key;
                    thContainer.appendChild(titleContent);
                    //create sort btn
                    const sortBtn: HTMLSpanElement = document.createElement('span');
                    let iconCls: string = '-icon';
                    state.sortDataAttrs.forEach(sda => {
                        if (sda.attr === key) {
                            if (sda.sort === AttrSort.DESCENDING_ORDER) {
                                iconCls = `${AttrSort.DESCENDING_ORDER}${iconCls}`;
                            } else {
                                iconCls = `${AttrSort.ASSCENDING_ORDER}${iconCls}`;
                            }
                        }
                    })
                    sortBtn.className = 'sort-btn ' + iconCls;
                    sortBtn.onclick = () => {
                        let sort: string = AttrSort.ASSCENDING_ORDER;
                        if (sortBtn.classList.contains('asscending-icon')) {
                            sort = AttrSort.DESCENDING_ORDER;
                        }
                        // sortBtn.classList.toggle('asscending-icon');
                        // sortBtn.classList.toggle('descending-icon');
                        //triger action
                        let sortDataAttrArr: ISortDataAttr[] = [];
                        state.sortDataAttrs.forEach(sda => {
                            if (sda.attr === key) {
                                sortDataAttrArr.push({
                                    attr: key,
                                    sort: sort
                                })
                            } else {
                                sortDataAttrArr.push(sda);
                            }
                        })
                        //save histroy before update state
                        State.tmpStateBusket.push([action.UPDATE_DATA_SORT, sortDataAttrArr]);
                        State.saveHistory();
                        Reducer.triger(action.UPDATE_DATA_SORT, sortDataAttrArr);
                    }
                    thContainer.appendChild(sortBtn);
                    th.appendChild(thContainer);

                    headerTr.appendChild(th);
                })
                dataTable.appendChild(headerTr);
            }
            //create content
            const tr: HTMLTableRowElement = document.createElement('tr');
            tr.setAttribute('dataItem', markId);
            [markId, ...Object.values(dataItem)].forEach(value => {
                const td: HTMLTableCellElement = document.createElement('td');
                td.innerText = value.toString();
                td.onmousedown = (downEvt) => {
                    Reducer.triger(action.UPDATE_MOUSE_MOVING, true);
                    this.mouseDownCell(downEvt);
                }
                tr.appendChild(td);
            })
            dataTable.appendChild(tr);
            count++;
        })
        return dataTable;
    }

    public resetSelection() {
        this.selectedRows = [];
    }

    public mouseDownCell(evt: MouseEvent) {
        evt.preventDefault();
        const targetTd: HTMLElement = <HTMLElement>evt.target;
        if (evt.shiftKey) {
            if (this.selectedRows.length >= 0) {
                this.selectRange(targetTd);
            }
        } else {
            this.startRowIdx = targetTd.parentElement.getAttribute('dataItem');
            this.resetSelection();
            this.selectedRows.push(this.startRowIdx);
            SelectableTable.renderSelection(this.selectedRows);
            //save histroy before update state
            State.tmpStateBusket.push([action.UPDATE_SELECTION, this.selectedRows]);
            // State.tmpStateBusket.push([action.UPDATE_SELECTION, state.selection]);
            State.saveHistory();
            Reducer.triger(action.UPDATE_SELECTION, this.selectedRows);
        }
        document.onmousemove = (moveEvt) => {
            this.mouseMoveCell(moveEvt);
        }
        document.onmouseup = (upEvt) => {
            Reducer.triger(action.UPDATE_MOUSE_MOVING, false);
            this.mouseUpCell(upEvt);
        }
    }

    public mouseMoveCell(evt: MouseEvent) {
        evt.preventDefault();
        const targetTd: HTMLElement = <HTMLElement>evt.target;
        this.selectRange(targetTd);
    }

    public mouseUpCell(evt: MouseEvent) {
        evt.preventDefault();
        document.onmousemove = null;
        document.onmouseup = null;
    }

    public selectRange(targetTd: HTMLElement) {
        const tmpRowIdx: string = targetTd.parentElement.getAttribute('dataItem');
        const startIdx: number = state.dataOrder.indexOf(this.startRowIdx);
        const tmpIdx: number = state.dataOrder.indexOf(tmpRowIdx);
        let selectionStartIdx: number, selectionEndIdx: number;
        if (startIdx <= tmpIdx) {
            selectionStartIdx = startIdx;
            selectionEndIdx = tmpIdx;
        } else {
            this.startRowIdx = tmpRowIdx;
            selectionStartIdx = tmpIdx;
            selectionEndIdx = startIdx;
        }
        this.selectedRows = state.dataOrder.slice(selectionStartIdx, selectionEndIdx + 1);
        SelectableTable.renderSelection(this.selectedRows);
        //save histroy before update state
        // State.tmpStateBusket.push([action.UPDATE_SELECTION, state.selection]);
        State.tmpStateBusket.push([action.UPDATE_SELECTION, this.selectedRows]);
        State.saveHistory();
        Reducer.triger(action.UPDATE_SELECTION, this.selectedRows);
    }
}