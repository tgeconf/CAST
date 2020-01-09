import '../../assets/style/attrSort.scss'

export default class AttrBtn {
    selectInput: HTMLSpanElement;

    public createAttrSort(attrName: string) {
        this.selectInput = document.createElement('span');
        this.selectInput.className = 'attr-sort';
        const select: HTMLSelectElement = document.createElement('select');
        select.value = attrName;
        ['dataIndex', 'asscending', 'descending'].forEach(order => {
            const option: HTMLOptionElement = document.createElement('option');
            option.innerText = order;
            select.appendChild(option);
        })
        this.selectInput.appendChild(select);
    }
}