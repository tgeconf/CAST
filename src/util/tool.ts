export default class Tool {
    public static firstLetterUppercase(str: string): string {
        return str.charAt(0).toUpperCase() + str.slice(1);
    }
}