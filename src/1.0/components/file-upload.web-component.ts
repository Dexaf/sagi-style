import { SagiHTMLElement } from "../classes/web-component.class.ts";
import { styleUrl } from "./index-css-ref.ts";

/** TODO -
 * loading
 * jitter when dragging file over wrapper with file loaded
 * maybe css should be streamlined
  */

/** const of state of the file upload input */
const FILE_UPLOAD_STATE = {
    isDisabled: "is-disabled",
    hasFiles: "has-files",
    isNormal: "is-normal",
    isLoading: "is-loading",
    isDrag: "is-drag",
    isWrongMultiple: "is-wrong-multiple",
    isWrongType: "is-wrong-type",
} as const;
type FileUploadType = typeof FILE_UPLOAD_STATE[keyof typeof FILE_UPLOAD_STATE];

/**
 * This component is a wrapper for the file upload input.
 * It handles multiple uploads, disabled, accept attribute.
 * The file are not stored here but bubble through event when loaded.
 * the showed pieces of this component are handled via css and the status that get
 * updated along the flow
 */
export class FileUploadWebComponent extends SagiHTMLElement {
    // SECTION - PROPS
    /** usable attributes in this web component */
    protected readonly attributesKeys = {
        id: "id",
        disabled: "disabled",
        accept: "accept",
        multiple: "multiple",
    }
    /** observed attributes */
    protected readonly observedAttributes = [
        this.attributesKeys.id,
        this.attributesKeys.disabled,
        this.attributesKeys.accept,
        this.attributesKeys.multiple
    ];

    /** current state of the file upload input */
    private currentState: FileUploadType = "is-normal";

    //refs to all of the needed html tag inside the template
    private inputRef: HTMLInputElement | null = null;
    private clearFileBtnRef: HTMLButtonElement | null = null;
    private filePreviewContainerRef: HTMLDivElement | null = null;
    private labelWrapperRef: HTMLLabelElement | null = null;

    /** hold the state of disabled or not of input */
    private isDisabled: boolean = false;
    /** hold the state of multiple file input, used on drag and drop events */
    private isMultipleAllowed: boolean = false;
    /** hold the attribute value of the accept attribute for the file input */
    private accept: string | null = null;
    //NOTE - check https://stackoverflow.com/questions/7110353/html5-dragleave-fired-when-hovering-a-child-element
    /** used to check how inside we are in the dragged component */
    private dragLayerCounter = 0;
    // !SECTION - PROPS

    // SECTION - LIFECYCLE
    constructor() {
        super();

        //check on attribute id
        const id = this.getAttribute(this.attributesKeys.id);
        if (!id) {
            console.error('FileUploadWebComponent - connectedCallback \n attribute id is not present');
            return;
        }

        //check on accept attribute
        let accept = this.getAttribute(this.attributesKeys.accept);
        if (accept === null || accept.length === 0)
            accept = null
        this.accept = accept;


        //check on multiple attribute
        let multiple = this.getAttribute(this.attributesKeys.multiple);
        this.isMultipleAllowed = multiple !== null;

        //check on attribute disabled
        const disabledAttr = this.getAttribute(this.attributesKeys.disabled);
        if (disabledAttr != null && disabledAttr != 'false')
            this.isDisabled = true;

        //get template with id
        const templateContentRef = this.getTemplate(id, this.isDisabled, this.accept, this.isMultipleAllowed)
            .content
            .cloneNode(true) as DocumentFragment;

        const shadowRoot = this.attachShadow({ mode: "open" });
        //append to dom
        shadowRoot.appendChild(templateContentRef);
    }

    /** on component connected to dom */
    connectedCallback() {
        //get ref to all of the elements inside the component
        this.inputRef = this.shadowRoot!.querySelector("input[type='file']") as HTMLInputElement;
        this.clearFileBtnRef = this.shadowRoot!.querySelector(".clear-file-btn") as HTMLButtonElement;
        this.labelWrapperRef = this.shadowRoot!.querySelector('label') as HTMLLabelElement;
        this.filePreviewContainerRef = this.shadowRoot!.querySelector(".file-preview-container") as HTMLDivElement;

        //init state of component
        if (this.isDisabled)
            this.updateState(FILE_UPLOAD_STATE.isDisabled);
        else
            this.updateState(FILE_UPLOAD_STATE.isNormal);

        this.inputRef.addEventListener('change', this.onInputChange);
        this.clearFileBtnRef.addEventListener('click', this.onClearBtnClick);

        this.labelWrapperRef.addEventListener("dragenter", this.onDragEnter);
        this.labelWrapperRef.addEventListener("dragleave", this.onDragLeave);
        this.labelWrapperRef.addEventListener("dragover", this.onDragOver);
        this.labelWrapperRef.addEventListener("drop", this.onDrop);
    }

    /** on component removed from dom */
    disconnectedCallback() {
        this.inputRef?.removeEventListener('change', this.onInputChange);
        this.clearFileBtnRef?.removeEventListener('click', this.onClearBtnClick);

        this.labelWrapperRef?.removeEventListener("dragover", this.onDragEnter);
        this.labelWrapperRef?.removeEventListener("dragleave", this.onDragLeave);
        this.labelWrapperRef?.removeEventListener("dragover", this.onDragOver);
        this.labelWrapperRef?.removeEventListener("drop", this.onDrop);
    }

    /** on attribute change callback */
    attributeChangedCallback(name: string, oldValue: string, newValue: string) {
        switch (name) {
            case this.attributesKeys.disabled:
                this.handleAttributeChangeDisabled(oldValue, newValue);
                break;

            default:
                break;
        }
    }
    // !SECTION - LIFECYCLE

    // SECTION - METHODS
    /** template used for this web component */
    protected getTemplate(id: string, isDisabled: boolean, accept: string | null, multiple: boolean): HTMLTemplateElement {
        const t = document.createElement("template");

        //handle accept attribute
        let acceptAttributeHtml = '';
        if (accept != null)
            acceptAttributeHtml = `accept="${accept}"`;
        t.innerHTML = //html 
            `
            <link rel="stylesheet" href="${styleUrl}">
            <label class="label-for-file-upload column no-wrap rg-05 just-se align-i-c" for="${id}-input">
                <span class="upload-file-label-wrapper">
                    <slot name="upload-file-label"></slot>
                </span>
                <div class="drop-label">
                    <slot name="drop-label"></slot>
                </div>
                <div class="wrong-type-label">
                    <slot name="wrong-type-label"></slot>
                </div>
                <div class="wrong-multiple-label">
                    <slot name="wrong-multiple-label"></slot>
                </div>
                <div class="disabled-label">
                    <slot name="disabled-label"></slot>
                </div>
                <div class="input-file-loading-container"></div>
                <input 
                    id="${id}-input" 
                    class="hidden"
                    type="file" 
                    ${acceptAttributeHtml} 
                    ${isDisabled ? 'disabled' : ''} 
                    ${multiple ? "multiple" : ""}
                />
                <div class="file-preview-wrapper h-100 column no-wrap just-ce m-auto">
                    <div class="file-preview-container column no-wrap rg-1 bord-col-dark">
                    </div>
                    <button class="clear-file-btn w-100">
                        <div class="icon close clear-file m-auto"></div>
                    </button>
                </div>
            </label>
        `;

        return t;
    }

    /** handle upload of file and preview if image */
    private onInputChange = () => {
        const files = this.inputRef!.files;

        if (!files) {
            this.updateState(FILE_UPLOAD_STATE.isNormal);
            this.resetFile();
            return;
        }

        //check if invalid drop
        const unacceptedFiles = this.getFilesWithNonValidType(files);
        if (unacceptedFiles.length > 0) {
            this.updateState(FILE_UPLOAD_STATE.isWrongType);
            this.dragLayerCounter = 0;
            let wrongTypes = Array.from(unacceptedFiles).map(uf => ({ name: uf.name, type: uf.type }));
            //SEND EVENT THAT FILes WRONG TYPE TO LET THE DEVELOPER DECIDE HOW TO SHOW IT
            this.dispatchEvent(
                new CustomEvent("wrong-types-loaded", {
                    detail: {
                        wrongTypes: wrongTypes
                    },
                    bubbles: true,
                    composed: true
                })
            )
            return;
        }

        this.updateState(FILE_UPLOAD_STATE.isLoading);

        this.handleFiles(files)
    }

    /** handle click of clear button by calling resetfile */
    private onClearBtnClick = (e: Event) => {
        e.preventDefault();
        e.stopPropagation();

        this.updateState(FILE_UPLOAD_STATE.isNormal);
        this.resetFile();
    }


    /** handle the drag of files over the input */
    private onDragEnter = (e: DragEvent) => {
        e.preventDefault();
        e.stopPropagation();

        //don't update status if disabled
        if (this.isDisabled) return;

        this.dragLayerCounter++;

        if (this.dragLayerCounter === 1)
            this.updateState(FILE_UPLOAD_STATE.isDrag);
    }

    /** handle the leave of drag of files from the input */
    private onDragLeave = (e: DragEvent) => {
        e.preventDefault();
        e.stopPropagation();

        //don't update status if disabled
        if (this.isDisabled) return;

        this.dragLayerCounter--;

        if (this.dragLayerCounter <= 0)
            this.updateState(FILE_UPLOAD_STATE.isNormal);
    }

    /** this event is needed because without it the drop event it's not triggered */
    private onDragOver = (e: DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
    }

    /** handle the drop of the dragger files */
    private onDrop = (e: DragEvent) => {
        e.preventDefault();
        e.stopPropagation();

        //don't update status if disabled
        if (this.isDisabled) return;

        let files: null | FileList = null;
        if (e.dataTransfer)
            files = e.dataTransfer.files;

        if (!files) {
            this.updateState(FILE_UPLOAD_STATE.isNormal);
            return;
        }

        //check if invalid drop
        if (this.areFilesMultipleValid(files) === false) {
            this.updateState(FILE_UPLOAD_STATE.isWrongMultiple);
            this.dragLayerCounter = 0;
            return;
        }

        const unacceptedFiles = this.getFilesWithNonValidType(files);
        if (unacceptedFiles.length > 0) {
            this.updateState(FILE_UPLOAD_STATE.isWrongType);
            this.dragLayerCounter = 0;
            let wrongTypes = Array.from(unacceptedFiles).map(uf => ({ name: uf.name, type: uf.type }));
            //SEND EVENT THAT FILes WRONG TYPE TO LET THE DEVELOPER DECIDE HOW TO SHOW IT
            this.dispatchEvent(
                new CustomEvent("wrong-types-loaded", {
                    detail: {
                        wrongTypes: wrongTypes
                    },
                    bubbles: true,
                    composed: true
                })
            )
            return;
        }

        //files are valid and we can handle them
        this.handleFiles(files);
    }

    /** checks if the file list length is valid regarding the current isMultipleAllowed value */
    private areFilesMultipleValid(files: FileList): boolean {
        if (this.isMultipleAllowed) return true;
        if (this.isMultipleAllowed === false &&
            files.length <= 1)
            return true;

        return false;
    }

    /** checks if the file list length is valid regarding the current isMultipleAllowed value */
    private getFilesWithNonValidType(files: FileList): File[] {
        if (!this.accept) return [];

        const acceptArray = this.accept.split(',');
        let isFileAccepted = false;
        let unacceptedFiles: File[] = [];
        //gets files
        for (let i = 0; i < files.length; i++) {
            const file = files[i];
            //reset for check
            isFileAccepted = false

            //pass file through accepts
            for (let j = 0; j < acceptArray.length; j++) {
                const accept = acceptArray[j];

                //if star type strip the star and check for includes
                if (accept.includes("*"))
                    isFileAccepted = file.type.includes(accept.split('*')[0]);
                else if (accept === file.type)
                    isFileAccepted = true;

                //if file is accepted no need to check further
                if (isFileAccepted) break;
            }

            //when we found the first wrong one we get out of the loop
            if (isFileAccepted === false)
                unacceptedFiles.push(file);
        }

        //if a file is not accepted we get out of the loop and the have false as value
        return unacceptedFiles;
    }

    /** handles the files by reading them and sending them outwards with an event */
    private handleFiles(files: FileList) {
        //empty the old file preview
        this.filePreviewContainerRef!.innerHTML = '';

        const filesData: string[] = [];

        for (let i = 0; i < files.length; i++) {
            const file = files[i];
            const reader = new FileReader();

            //fallback
            reader.onerror = (e) => {
                alert(e)
                this.updateState(FILE_UPLOAD_STATE.isNormal);
            };

            reader.onload = (e) => {
                const fileBlob = e.target?.result as string;
                filesData.push(fileBlob);

                //handle preview
                let imageUrl: null | string = null
                if (file.type.startsWith("image/"))
                    imageUrl = fileBlob;

                let fileName = file.name.slice(0, 40);
                //preview of full name if name is too long
                if (file.name.length > 40)
                    fileName += `... ${file.name.slice(file.name.length - 4, file.name.length + 1)}`

                const templateforFileEntry = document.createElement("template");

                templateforFileEntry.innerHTML = //html
                    `
                    <div class="t-a-center">
                        ${imageUrl ? `<img src="${imageUrl}"/>` : '<div class="icon size-5 file-written bg-light m-auto mb-05"></div>'}
                        <p>${fileName}</p>
                        <hr/>
                    </div>
                `;

                this.filePreviewContainerRef?.appendChild(
                    templateforFileEntry.content.cloneNode(true)
                )

                //fire event only when all the files are loaded
                if (filesData.length === files.length) {
                    this.updateState(FILE_UPLOAD_STATE.hasFiles);
                    //SEND EVENT AFTER FILES ARE UPLOADED
                    this.dispatchEvent(
                        new CustomEvent("file-uploaded", {
                            detail: {
                                files: filesData
                            },
                            bubbles: true,
                            composed: true
                        })
                    )
                }
            };
            reader.readAsDataURL(file);
        }
    }

    /** removes file */
    private resetFile() {
        this.inputRef!.value = "";
        this.filePreviewContainerRef!.innerHTML = '';
        this.dragLayerCounter = 0;

        this.dispatchEvent(
            //SEND EVENT THAT FILE WAS REMOVED
            new CustomEvent("file-removed", {
                detail: {},
                bubbles: true,
                composed: true
            })
        )
    }

    /** changes the state of disabled on input*/
    private handleAttributeChangeDisabled(oldValue: string, newValue: string) {
        let shouldDisable = false;

        if (oldValue == null && newValue != 'false')
            shouldDisable = true;

        this.isDisabled = shouldDisable;

        // at beginning inputRef is null 
        if (this.inputRef)
            this.inputRef.disabled = this.isDisabled;

    }

    /** handles the logic flow of state of the file upload component */
    public updateState(nextState: FileUploadType) {
        //remove current status class
        this.labelWrapperRef!.classList.remove(this.currentState);
        //update status and class
        this.currentState = nextState;
        this.labelWrapperRef!.classList.add(this.currentState);
    }
    // !SECTION - METHODS
}

//add custom element to window registry
customElements.define('st-file-upload', FileUploadWebComponent);