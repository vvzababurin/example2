import modules from "./modules/radio/index.mjs"
import preset from "./template/index.mjs"

const getTemplate = (html) => {
  return new Promise(function (resolve, reject) {
    let parser = new DOMParser()
    let body = parser.parseFromString(html, "text/html")
    resolve(body.getElementsByTagName("template")[0].content.cloneNode(true))
  })
}

const getCss = (css) => {
  return new Promise(function (resolve, reject) {
    let style = document.createElement("style")
    style.textContent = `${css}`
    resolve(style)
  })
}

const props = (self) => {
  return new Promise(function (resolve, reject) {
    let props = { }
    props.this = self
    props.component = self.tagName.toLowerCase()
    resolve(props)
  })
}

const template = (component) => {
  return new Promise(async (resolve, reject) => {
    component.template = (component.this.dataset.preset)
        ? await preset(component.this.dataset.preset)
        : await preset("default")
    let body = await getTemplate(component.template.html)
    component.this.attachShadow({mode: "open"})
    let css = await getCss(component.template.css)
    component.this.shadowRoot.appendChild(body)
    component.this.shadowRoot.appendChild(css)
    resolve(component)
  })
}

const nkRadio = class extends HTMLElement
{
  constructor () {
    super()
    props(this)
      .then(component => template(component))
      .then(async component => {
        let radio = new (await modules())(component)
      })
  }
}

if (customElements.get("nk-radio") === undefined) {
  customElements.define("nk-radio", nkRadio );
};

export default { nkRadio }
