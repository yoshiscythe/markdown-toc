export class Anchor {
    id: string = "";
    name: string = "";

    constructor(headerText:string) {
        headerText = headerText.replace(" ", "-");
        this.id = "markdown-" + encodeURIComponent(headerText);
        this.name = encodeURIComponent(headerText);
    }
}