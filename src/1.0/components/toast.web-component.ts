import { SagiHTMLElement } from "../classes/web-component.class";
import indexCss from "../index.css?inline";

export class ToastWebComponent extends SagiHTMLElement {
    // SECTION - PROPS
    /** usable attributes in this web component */
    protected attributesKeys = {
        type: "type"
    };
    /** ref to button to close toast */
    toastCloseBtn: HTMLButtonElement | null = null;
    /** ref to dive that represent elapse of countdown */
    countdownBar: HTMLElement | null = null;
    // !SECTION - PROPS

    // SECTION - LIFECYCLE
    constructor() {
        super();

        const templateContentRef = this.getTemplate()
            .content
            .cloneNode(true) as DocumentFragment;
        const shadowRoot = this.attachShadow({ mode: "open" });
        const sharedSheet = new CSSStyleSheet();
        sharedSheet.replaceSync(indexCss);
        shadowRoot.adoptedStyleSheets = [sharedSheet];
        //append to dom
        shadowRoot.appendChild(templateContentRef);
    }
    // !SECTION - LIFECYCLE

    // SECTION - METHODS
    /** on component connected to dom */
    connectedCallback() {
        //get ref to all of the elements inside the component
        this.toastCloseBtn = this.shadowRoot?.querySelector(".toast-close-button") as HTMLButtonElement;

        this.toastCloseBtn.addEventListener('click', this.destroyToast);

        let typeAttr = this.getAttribute(this.attributesKeys.type);
        //check if we need fallback
        if (typeAttr !== 'normal' &&
            typeAttr !== 'success' &&
            typeAttr !== 'warning' &&
            typeAttr !== 'error')
            typeAttr = 'normal';

        let typeClassString = '';
        switch (typeAttr) {
            case "success":
                typeClassString = 'bg-green t-dark shadow-blue';
                break;
            case "error":
                typeClassString = 'bg-red t-light shadow-dark';
                break;
            case "warning":
                typeClassString = 'bg-yellow t-dark shadow-dark';
                break;
            default:
                typeClassString = 'bg-light t-dark bord-col-dark shadow-dark';
                break;
        }

        this.shadowRoot!.querySelector(".toast")!.classList += ` ${typeClassString}`;
    }

    /** on component removed from dom */
    disconnectedCallback() {
        this.toastCloseBtn?.removeEventListener('click', this.destroyToast);
        if (this.animationFrameId)
            cancelAnimationFrame(this.animationFrameId);
    }

    protected getTemplate(): HTMLTemplateElement {
        const t = document.createElement('template');

        t.innerHTML = //html 
            `
            <div class="toast">
                <div class="row just-e">
                    <button class="toast-close-button">
                        <div class="icon close"></div>
                    </button>
                </div>
                <div class="pb-1 px-1">
                    <slot></slot>
                </div>
                <div class="countdown-bar-wrapper w-100">
                    <div class="countdown-bar h-100">
                    </div>
                </div>
            </div>
        `;

        return t;
    }

    /** remove the toast */
    destroyToast = () => {
        this.remove();
    }

    private start: number = 0;
    private timeForTheCountdown: number = 0;
    private animationFrameId: number | null = null;

    /**
     * @param timeForTheCountdown start countdown time to destroy of toast
     */
    startCountdown = (timeForTheCountdown: number) => {
        this.start = Date.now();
        this.timeForTheCountdown = timeForTheCountdown;
        this.countdownBar = this.shadowRoot?.querySelector('.countdown-bar') ?? null;
        this.animationFrameId = requestAnimationFrame(this.elapseCountdown);
    }

    /** updates state and animation of countdown, destroy toast when reaches the end */
    private elapseCountdown = () => {
        const elapsedTime = Date.now() - this.start;
        let percOfCompletion = elapsedTime / this.timeForTheCountdown;
        //reverse to have a countdown normalized in 100 to 0
        percOfCompletion = (1 - percOfCompletion) * 100;

        //animate the width
        this.countdownBar!.style.width = `${percOfCompletion}%`;

        //keep animation unless reached end of the countdown, then destroy
        if (elapsedTime < this.timeForTheCountdown)
            this.animationFrameId = requestAnimationFrame(this.elapseCountdown);
        else
            this.animationFrameId = requestAnimationFrame(() => this.destroyToast());
    }
    // !SECTION - METHODS

}

//add custom element to window registry
customElements.define('st-toast', ToastWebComponent);