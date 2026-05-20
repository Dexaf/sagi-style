# Sagi style

Sagi style is a repository for the design system used for internal sagitauros
studio's application. As such the package is unlicensed and can't be used
without permission.

## Tips

- To read this repo Better I advise using Better Comments by aaron bond and
  Comment Anchors by ExodiusStudios on VSCodium or Visual Studio Code to have
  colors and an index of code sections in the plugin tab.

## Maintenance

- The commits will start with words that explains the purpose of the commits, if
  the commit have more then one purpose use & to add more then one purpose or
  use only the major purpose if the other modification are of lesser importance
  - **START**: creation of repository.
  - **FEAT**: feature added to the repository.
  - **FIX**: fixed something in the repository.
  - **DOCS**: added comments, doc files or renamed variables to be more
    explicative.
  - **RFCT**: refactored the structure of code.
  - **RNM**: renamed files.
  - **TEST**: added tests to the repo.
- I hope i'll be able to maintain what i said in the previous point.
- Use early return guard instead of big nested if.
- Throw errors with meaningfull message, specify SFYRI and the name of the
  method throwing the error with \n after to make a cleaner visualization of the
  message.

# Usage

To use the assets and web component who reference the assets correctly add this
to your vite config:

```ts
function copyAssetsPlugin() {
	return {
		name: "copy-assets-plugin",
		apply: "build",
		buildStart() {
			const src = path.resolve("node_modules/@dexaf/dist/sagi-style/assets");
			const dest = path.resolve("public/sagi-style/assets");
			fs.cpSync(src, dest, { recursive: true });
		},
	};
}
```
or copy the sagi-style folder in your public assets at the root of the folder

# Web components

## File upload

Custom element: `st-file-upload`

This component is a wrapper around a native file input. It supports:

- drag and drop
- file type validation
- multiple files
- disabled state
- image preview
- custom labels through slots

The component does not persist files internally. Loaded files are emitted
through custom events.

### Attributes

| Attribute  | Type    | Description                                                |
| ---------- | ------- | ---------------------------------------------------------- |
| `id`       | string  | Required id used internally for the input/label connection |
| `disabled` | boolean | Disable the component                                      |
| `accept`   | string  | Accepted mime types                                        |
| `multiple` | boolean | Allow multiple file upload                                 |

### Slots

| Slot                   | Description                                 |
| ---------------------- | ------------------------------------------- |
| `upload-file-label`    | Default upload label                        |
| `drop-label`           | Label shown during drag                     |
| `wrong-type-label`     | Label shown when file type is invalid       |
| `wrong-multiple-label` | Label shown when too many files are dropped |
| `disabled-label`       | Label shown when component is disabled      |

### Events

| Event                | Description                              | Payload                                          |
| -------------------- | ---------------------------------------- | ------------------------------------------------ |
| `file-uploaded`      | Fired when files are loaded              | `{ files: string[] }`                            |
| `file-removed`       | Fired when files are removed             | `{}`                                             |
| `wrong-types-loaded` | Fired when invalid file types are loaded | `{ wrongTypes: { name:string, type:string }[] }` |

### Example

```html
<st-file-upload id="avatar-upload" accept="image/png,image/jpeg" multiple>
	<span slot="upload-file-label"> Upload files </span>

	<span slot="drop-label"> Drop files here </span>

	<span slot="wrong-type-label"> Invalid file type </span>

	<span slot="wrong-multiple-label"> Too many files </span>

	<span slot="disabled-label"> Upload disabled </span>
</st-file-upload>
```

### Example event listener

```ts
const uploadRef = document.querySelector("st-file-upload");

uploadRef?.addEventListener("file-uploaded", (e: any) => {
	console.log(e.detail.files);
});
```

---

## Modal

Custom element: `st-modal`

This component is a modal with a shadow curtain behind it. The header, content
and footer are customizable through slots.

The open and close logic is handled internally.

### Attributes

| Attribute | Type   | Description               |
| --------- | ------ | ------------------------- |
| `id`      | string | Required id for the modal |

### Slots

| Slot      | Description        |
| --------- | ------------------ |
| `title`   | Modal title        |
| `content` | Main modal content |
| `footer`  | Footer actions     |

### Events

| Event          | Description                |
| -------------- | -------------------------- |
| `modal-opened` | Fired when modal is opened |
| `modal-closed` | Fired when modal is closed |

### Public methods

| Method        | Description     |
| ------------- | --------------- |
| `openModal()` | Opens the modal |

### Example

```html
<st-modal id="example-modal">
	<span slot="title"> Modal title </span>

	<div slot="content">Modal content</div>

	<div slot="footer">
		<button>Confirm</button>
	</div>
</st-modal>
```

### Example usage

```ts
const modalRef = document.querySelector("st-modal") as any;

modalRef.openModal();
```

---

## Navbar

Custom element: `st-navbar`

This component is a responsive navbar with a dropdown menu. The dropdown content
is customizable through a slot.

The open and close logic is handled internally.

### Slots

| Slot      | Description             |
| --------- | ----------------------- |
| `content` | Navbar dropdown content |

### Example

```html
<st-navbar>
	<nav slot="content">
		<ul>
			<li>
				<a href="/">Home</a>
			</li>

			<li>
				<a href="/about">About</a>
			</li>
		</ul>
	</nav>
</st-navbar>
```

---

## Toast

Custom element: `st-toast`

This component is a toast notification with:

- close button
- countdown bar
- different visual states

The toast can destroy itself automatically after a countdown.

### Attributes

| Attribute | Type   | Description                                         |
| --------- | ------ | --------------------------------------------------- |
| `type`    | string | Toast type: `normal`, `success`, `warning`, `error` |

### Slots

| Slot      | Description   |
| --------- | ------------- |
| `default` | Toast content |

### Public methods

| Method                      | Description                   |
| --------------------------- | ----------------------------- |
| `destroyToast()`            | Removes the toast             |
| `startCountdown(ms:number)` | Starts auto destroy countdown |

### Example

```html
<st-toast type="success"> User created successfully </st-toast>
```

### Example usage

```ts
const toast = document.querySelector("st-toast") as any;

toast.startCountdown(5000);
```
