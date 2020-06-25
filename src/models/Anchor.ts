export class Anchor {
    id: string = "";
    name: string = "";

    constructor(headerText:string) {
        headerText = headerText.toLowerCase().replace(/\s/gi, "-");
        this.id = "markdown-" + encodeURIComponent(headerText);
        this.name = encodeURIComponent(headerText);
    }
}