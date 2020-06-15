export class Anchor {
    id: string = "";
    name: string = "";

    constructor(headerText:string) {
        headerText = headerText.replace(/\s/gi, "-");
        this.id = "markdown-" + encodeURIComponent(headerText);
        this.name = encodeURIComponent(headerText);
    }
}