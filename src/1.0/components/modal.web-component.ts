import { SagiHTMLElement } from "../classes/web-component.class";
import indexCss from "../index.css?inline";

/**
 * This component is a modal with a shadow curtain behind, 
 * the modal content itself is customizable with a slot placed 
 * for the header, the content and the footer.
 * The open/close logic is taken care of inside and an event 
 * is fired when those things happens.
 */
export class ModalWebComponent extends SagiHTMLElement {
    //SECTION - PROPS
    /** usable attributes in this web component */
    protected readonly attributesKeys = {
        id: "id",
        big: "big"
    };

    //refs to all of the needed html tag inside the template
    private closeModalBtnRef: HTMLButtonElement | null = null;
    private shadowCurtainRef: HTMLElement | null = null;
    /** flag to check if web componet is inited or not */
    private isWcInit = false;
    //!SECTION - PROPS

    //SECTION - LIFECYCLE
    constructor() {
        super();
    }

    /** on component connected to dom */
    connectedCallback() {
        this.tryInit();
    }

    /** on component removed from dom */
    disconnectedCallback() {
        this.closeModalBtnRef?.removeEventListener('click', this.onCloseModal);
        this.shadowCurtainRef?.removeEventListener('click', this.onCloseModal);
    }

    /** observed attributes */
    static get observedAttributes() {
        return [
            "id",
            "big"
        ]
    };

    /** on attributes change */
    attributeChangedCallback(name: string, _: string, newValue: string) {
        if (name === this.attributesKeys.id && newValue)
            this.tryInit();
    }
    //!SECTION - LIFECYCLE

    //SECTION - METHODS
    /** try to init the web component callback*/
    private tryInit() {
        if (this.isWcInit) return;

        //check on attribute id
        const id = this.getAttribute(this.attributesKeys.id);
        if (!id) {
            console.error('FileUploadWebComponent - tryInit \n attribute id is not present');
            return;
        }

        const isBig = this.getAttribute(this.attributesKeys.big) !== null;
        const templateContentHtml = this.getTemplate(id, isBig)
            .content
            .cloneNode(true) as DocumentFragment;

        const shadowRoot = this.attachShadow({ mode: "open" })
        const sharedSheet = new CSSStyleSheet();
        sharedSheet.replaceSync(indexCss);
        shadowRoot.adoptedStyleSheets = [sharedSheet];
        //append to dom
        shadowRoot.appendChild(templateContentHtml);

        //get ref to all of the elements inside the component
        this.closeModalBtnRef = this.shadowRoot?.querySelector(".close-button") as HTMLButtonElement;
        this.shadowCurtainRef = this.shadowRoot?.querySelector(".shadow-curtain") as HTMLElement;

        this.closeModalBtnRef.addEventListener('click', this.onCloseModal);
        this.shadowCurtainRef.addEventListener('click', this.onCloseModal);

        this.isWcInit = true;
    }

    protected getTemplate(id: string, isBigger: boolean): HTMLTemplateElement {
        const t = document.createElement('template');
        t.innerHTML = //html
            `
            <div id="${id}" class="modal hidden ${isBigger ? "big" : ""}">
                <div class="modal-body container-60 bg-light">
                    <div class="modal-header px-2 py-1 row just-sb">
                        <h2><slot name="title"></slot></h2>
                        <button class="close-button"><div class="icon close"></div></button>
                    </div>
                    <hr class="m-0" />
                    <div class="modal-content px-2 py-2">
                        <slot name="content"></slot>
                    </div>
                    <hr class="m-0" />
                    <div class="modal-footer px-2 py-1">
                        <slot name="footer"></slot>
                    </div>
                </div>
                <!-- shadow curtain is the dark screen under the modal -->
                <div class="shadow-curtain wh-100"></div>
            </div>
        `
        return t;
    }

    /** method that must be used outside to show the modal */
    public openModal = () => {
        const modalRef = this.shadowRoot?.querySelector('.modal') as HTMLDivElement;
        modalRef.classList.remove('hidden');

        document.body.style.overflow = 'hidden';

        //SEND EVENT THAT MODAL WAS OPENED
        this.dispatchEvent(new CustomEvent("modal-opened", {
            detail: {},
            bubbles: true,
            composed: true
        }))
    }

    /** closes the modal */
    private onCloseModal = () => {
        const modalRef = this.shadowRoot?.querySelector('.modal') as HTMLDivElement;
        modalRef.classList.add('hidden');

        document.body.style.overflow = 'auto';

        //SEND EVENT THAT MODAL WAS CLOSED
        this.dispatchEvent(new CustomEvent("modal-closed", {
            detail: {},
            bubbles: true,
            composed: true
        }))
    }
    //!SECTION - METHODS
}

//add custom element to window registry
customElements.define('st-modal', ModalWebComponent);