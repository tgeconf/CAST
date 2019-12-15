import '../assets/style/nav-separator.scss';

export default class Separator{
    public static createSeparator(){
        const sep = document.createElement('span');
        sep.className = 'separator';
        return sep;
    }
}