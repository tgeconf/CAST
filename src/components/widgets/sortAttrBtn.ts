import '../../assets/style/sortAttrBtn.scss'

export default class sortAttrBtn {
    attrBtn: HTMLSpanElement;
    attrSort: HTMLSelectElement;

    public createAttrBtn() {
        this.attrBtn = document.createElement('span');
    }

    public createAttrSort() {
        this.attrSort = document.createElement('select');
    }
}