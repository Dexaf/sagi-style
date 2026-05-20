import { SagiHTMLElement } from "../classes/web-component.class";
import { styleUrl } from "./index-css-ref";

/**
 * This component is a navbar with a dropdown menu, 
 * the menu content itself is customizable with a slot placed inside.
 * The open/close logic is taken care of inside
 */
export class NavbarWebComponent extends SagiHTMLElement {
    // SECTION - PROPS
    protected attributesKeys = {};
    protected observedAttributes = [];

    //refs to all of the needed html tag inside the template
    private menuBtnRef: HTMLButtonElement | null = null;
    private navbarMenuRef: HTMLDivElement | null = null;
    private shadowCurtainRef: HTMLDivElement | null = null;
    // !SECTION - PROPS

    // SECTION - LIFECYCLE
    constructor() {
        super();

        const templateContentHtml = this.getTemplate()
            .content
            .cloneNode(true) as DocumentFragment;

        const shadowRoot = this.attachShadow({ mode: 'open' });
        //append to dom
        shadowRoot.appendChild(templateContentHtml);
    }

    /** on component connected to dom */
    connectedCallback() {
        //get ref to all of the elements inside the component
        this.menuBtnRef = this.shadowRoot!.querySelector("#menu-btn") as HTMLButtonElement;
        this.navbarMenuRef = this.shadowRoot!.querySelector("#navbar-drop-menu") as HTMLDivElement;
        this.shadowCurtainRef = this.shadowRoot!.querySelector("#navbar-shadow-curtain") as HTMLDivElement;

        this.menuBtnRef.addEventListener('click', this.onMenuBtnClick);
        this.shadowCurtainRef.addEventListener('click', this.onShadowCurtainClick);
    }

    /** on component removed from dom */
    disconnectedCallback() {
        this.menuBtnRef?.removeEventListener('change', this.onMenuBtnClick);
        this.shadowCurtainRef?.removeEventListener('click', this.onShadowCurtainClick);
    }
    // !SECTION - LIFECYCLE

    // SECTION - METHODS
    protected getTemplate(): HTMLTemplateElement {
        const t = document.createElement('template');

        t.innerHTML = //html
            `
            <link rel="stylesheet" href="${styleUrl}">
            <header class="bg-dark t-light row just-sb">
                <a id="logo-link" href="/">
                    <img src="/images/logo/logo-small.png" class="logo layer blue" />
                    <img src="/images/logo/logo-small.png" class="logo layer green" />
                </a>
                <button id="menu-btn">
                    <div class="icon menu size-25 m-auto"></div>
                </button>
            </header>
            <div id="navbar-drop-menu" class="t-light w-100">
                <div id="navbar-drop-menu-content" class="p-2">
                    <slot name="content"></slot>
                </div>
            </div>
            <!-- shadow curtain is the dark screen under the modal -->
            <div id="navbar-shadow-curtain" class="shadow-curtain"></div>
        `;

        return t;
    }

    /** handle toggle of menu */
    private onMenuBtnClick = () => {
        //replace icon of menu button
        const iconDiv = this.menuBtnRef?.querySelector('.icon');
        if (iconDiv) {
            if (iconDiv.classList.contains('menu')) {
                iconDiv.classList.remove('menu');
                iconDiv.classList.add('close');
            } else {
                iconDiv.classList.remove('close');
                iconDiv.classList.add('menu');
            }
        }

        if (this.navbarMenuRef)
            this.navbarMenuRef.classList.toggle('show')
    }

    private onShadowCurtainClick = () => {
        //restore basic menu icon on menu button
        const iconDiv = this.menuBtnRef?.querySelector('.icon');
        if (iconDiv) {
            iconDiv.classList.remove('close');
            iconDiv.classList.add('menu');
        }

        if (this.navbarMenuRef)
            this.navbarMenuRef.classList.remove('show')
    }
    // !SECTION - METHODS

}

//add custom element to window registry
customElements.define('st-navbar', NavbarWebComponent);