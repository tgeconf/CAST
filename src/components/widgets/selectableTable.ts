import '../../assets/style/selectableTable.scss'
import { state, State } from '../../app/state'
import { IDataItem, ISortDataAttr } from '../../app/core/ds';
import Reducer from '../../app/reducer';
import * as action from '../../app/action'
import AttrSort from './attrSort';
import Util from '../../app/core/util';

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
                    th.className = 'non-activate-th';
                    const thContainer: HTMLDivElement = document.createElement('div');
                    thContainer.className = 'th-container';
                    const titleContent: HTMLParagraphElement = document.createElement('p');
                    titleContent.innerHTML = key;
                    titleContent.className = 'non-activate-p';
                    thContainer.appendChild(titleContent);
                    //create sort btn
                    const sortBtn: HTMLSpanElement = document.createElement('span');
                    let iconCls: string = '';
                    state.sortDataAttrs.forEach(sda => {
                        if (sda.attr === key) {
                            if (sda.sort === AttrSort.DESCENDING_ORDER) {
                                iconCls = `${AttrSort.DESCENDING_ORDER}-icon activate-sort-btn`;
                                th.title = `${key} in descending order`;
                                titleContent.classList.remove('non-activate-p');
                                th.classList.remove('non-activate-th');
                            } else if (sda.sort === AttrSort.ASSCENDING_ORDER) {
                                iconCls = `${AttrSort.ASSCENDING_ORDER}-icon activate-sort-btn`;
                                th.title = `${key} in asscending order`;
                                titleContent.classList.remove('non-activate-p');
                                th.classList.remove('non-activate-th');
                            } else {
                                th.title = `Click to sort by ${key}`;
                            }
                        }
                    })
                    sortBtn.className = 'sort-btn ' + iconCls;

                    th.onclick = () => {
                        let sort: string = AttrSort.ASSCENDING_ORDER;
                        if (!sortBtn.classList.contains('asscending-icon') && !sortBtn.classList.contains('descending-icon')) {
                            th.title = `${key} in asscending order`;
                            sort = AttrSort.ASSCENDING_ORDER;
                        } else if (sortBtn.classList.contains('asscending-icon')) {
                            th.title = `${key} in descending order`;
                            sort = AttrSort.DESCENDING_ORDER;
                        } else if (sortBtn.classList.contains('descending-icon')) {
                            th.title = `${key} in asscending order`;
                            sort = AttrSort.ASSCENDING_ORDER;
                        }
                        //triger action
                        let sortDataAttrArr: ISortDataAttr[] = [];
                        state.sortDataAttrs.forEach(sda => {
                            if (sda.attr === key) {
                                sortDataAttrArr.push({
                                    attr: key,
                                    sort: sort
                                })
                            } else {
                                sortDataAttrArr.push({
                                    attr: sda.attr,
                                    sort: AttrSort.INDEX_ORDER
                                });
                            }
                        })
                        //save histroy before update state
                        State.tmpStateBusket.push({
                            historyAction: { actionType: action.UPDATE_DATA_SORT, actionVal: state.sortDataAttrs },
                            currentAction: { actionType: action.UPDATE_DATA_SORT, actionVal: sortDataAttrArr }
                        })
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
            State.tmpStateBusket.push({
                historyAction: { actionType: action.UPDATE_SELECTION, actionVal: state.selection },
                currentAction: { actionType: action.UPDATE_SELECTION, actionVal: this.selectedRows }
            })
            State.saveHistory();
            Reducer.triger(action.UPDATE_SELECTION, state.suggestion ? Util.suggestSelection(this.selectedRows) : this.selectedRows);
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
        State.tmpStateBusket.push({
            historyAction: { actionType: action.UPDATE_SELECTION, actionVal: state.selection },
            currentAction: { actionType: action.UPDATE_SELECTION, actionVal: this.selectedRows }
        })
        State.saveHistory();
        Reducer.triger(action.UPDATE_SELECTION, state.suggestion ? Util.suggestSelection(this.selectedRows) : this.selectedRows);
    }
}