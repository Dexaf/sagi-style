export abstract class SagiHTMLElement extends HTMLElement {
    // SECTION - PROPS
    /** usable attributes in this web component */
    protected readonly abstract attributesKeys: { [key: string]: string; };
    // !SECTION - PROPS

    // SECTION - METHODS
    protected abstract getTemplate(...args: any[]): HTMLTemplateElement
    // !SECTION - METHODS
}