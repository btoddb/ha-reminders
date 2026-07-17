var K=globalThis,B=K.ShadowRoot&&(K.ShadyCSS===void 0||K.ShadyCSS.nativeShadow)&&"adoptedStyleSheets"in Document.prototype&&"replace"in CSSStyleSheet.prototype,te=Symbol(),Ee=new WeakMap,A=class{constructor(i,e,t){if(this._$cssResult$=!0,t!==te)throw Error("CSSResult is not constructable. Use `unsafeCSS` or `css` instead.");this.cssText=i,this.t=e}get styleSheet(){let i=this.o,e=this.t;if(B&&i===void 0){let t=e!==void 0&&e.length===1;t&&(i=Ee.get(e)),i===void 0&&((this.o=i=new CSSStyleSheet).replaceSync(this.cssText),t&&Ee.set(e,i))}return i}toString(){return this.cssText}},Ce=n=>new A(typeof n=="string"?n:n+"",void 0,te),v=(n,...i)=>{let e=n.length===1?n[0]:i.reduce((t,r,s)=>t+(a=>{if(a._$cssResult$===!0)return a.cssText;if(typeof a=="number")return a;throw Error("Value passed to 'css' function must be a 'css' function result: "+a+". Use 'unsafeCSS' to pass non-literal values, but take care to ensure page security.")})(r)+n[s+1],n[0]);return new A(e,n,te)},ke=(n,i)=>{if(B)n.adoptedStyleSheets=i.map(e=>e instanceof CSSStyleSheet?e:e.styleSheet);else for(let e of i){let t=document.createElement("style"),r=K.litNonce;r!==void 0&&t.setAttribute("nonce",r),t.textContent=e.cssText,n.appendChild(t)}},ie=B?n=>n:n=>n instanceof CSSStyleSheet?(i=>{let e="";for(let t of i.cssRules)e+=t.cssText;return Ce(e)})(n):n;var{is:it,defineProperty:rt,getOwnPropertyDescriptor:nt,getOwnPropertyNames:st,getOwnPropertySymbols:at,getPrototypeOf:ot}=Object,V=globalThis,Te=V.trustedTypes,dt=Te?Te.emptyScript:"",lt=V.reactiveElementPolyfillSupport,M=(n,i)=>n,re={toAttribute(n,i){switch(i){case Boolean:n=n?dt:null;break;case Object:case Array:n=n==null?n:JSON.stringify(n)}return n},fromAttribute(n,i){let e=n;switch(i){case Boolean:e=n!==null;break;case Number:e=n===null?null:Number(n);break;case Object:case Array:try{e=JSON.parse(n)}catch{e=null}}return e}},De=(n,i)=>!it(n,i),Se={attribute:!0,type:String,converter:re,reflect:!1,useDefault:!1,hasChanged:De};Symbol.metadata??=Symbol("metadata"),V.litPropertyMetadata??=new WeakMap;var y=class extends HTMLElement{static addInitializer(i){this._$Ei(),(this.l??=[]).push(i)}static get observedAttributes(){return this.finalize(),this._$Eh&&[...this._$Eh.keys()]}static createProperty(i,e=Se){if(e.state&&(e.attribute=!1),this._$Ei(),this.prototype.hasOwnProperty(i)&&((e=Object.create(e)).wrapped=!0),this.elementProperties.set(i,e),!e.noAccessor){let t=Symbol(),r=this.getPropertyDescriptor(i,t,e);r!==void 0&&rt(this.prototype,i,r)}}static getPropertyDescriptor(i,e,t){let{get:r,set:s}=nt(this.prototype,i)??{get(){return this[e]},set(a){this[e]=a}};return{get:r,set(a){let d=r?.call(this);s?.call(this,a),this.requestUpdate(i,d,t)},configurable:!0,enumerable:!0}}static getPropertyOptions(i){return this.elementProperties.get(i)??Se}static _$Ei(){if(this.hasOwnProperty(M("elementProperties")))return;let i=ot(this);i.finalize(),i.l!==void 0&&(this.l=[...i.l]),this.elementProperties=new Map(i.elementProperties)}static finalize(){if(this.hasOwnProperty(M("finalized")))return;if(this.finalized=!0,this._$Ei(),this.hasOwnProperty(M("properties"))){let e=this.properties,t=[...st(e),...at(e)];for(let r of t)this.createProperty(r,e[r])}let i=this[Symbol.metadata];if(i!==null){let e=litPropertyMetadata.get(i);if(e!==void 0)for(let[t,r]of e)this.elementProperties.set(t,r)}this._$Eh=new Map;for(let[e,t]of this.elementProperties){let r=this._$Eu(e,t);r!==void 0&&this._$Eh.set(r,e)}this.elementStyles=this.finalizeStyles(this.styles)}static finalizeStyles(i){let e=[];if(Array.isArray(i)){let t=new Set(i.flat(1/0).reverse());for(let r of t)e.unshift(ie(r))}else i!==void 0&&e.push(ie(i));return e}static _$Eu(i,e){let t=e.attribute;return t===!1?void 0:typeof t=="string"?t:typeof i=="string"?i.toLowerCase():void 0}constructor(){super(),this._$Ep=void 0,this.isUpdatePending=!1,this.hasUpdated=!1,this._$Em=null,this._$Ev()}_$Ev(){this._$ES=new Promise(i=>this.enableUpdating=i),this._$AL=new Map,this._$E_(),this.requestUpdate(),this.constructor.l?.forEach(i=>i(this))}addController(i){(this._$EO??=new Set).add(i),this.renderRoot!==void 0&&this.isConnected&&i.hostConnected?.()}removeController(i){this._$EO?.delete(i)}_$E_(){let i=new Map,e=this.constructor.elementProperties;for(let t of e.keys())this.hasOwnProperty(t)&&(i.set(t,this[t]),delete this[t]);i.size>0&&(this._$Ep=i)}createRenderRoot(){let i=this.shadowRoot??this.attachShadow(this.constructor.shadowRootOptions);return ke(i,this.constructor.elementStyles),i}connectedCallback(){this.renderRoot??=this.createRenderRoot(),this.enableUpdating(!0),this._$EO?.forEach(i=>i.hostConnected?.())}enableUpdating(i){}disconnectedCallback(){this._$EO?.forEach(i=>i.hostDisconnected?.())}attributeChangedCallback(i,e,t){this._$AK(i,t)}_$ET(i,e){let t=this.constructor.elementProperties.get(i),r=this.constructor._$Eu(i,t);if(r!==void 0&&t.reflect===!0){let s=(t.converter?.toAttribute!==void 0?t.converter:re).toAttribute(e,t.type);this._$Em=i,s==null?this.removeAttribute(r):this.setAttribute(r,s),this._$Em=null}}_$AK(i,e){let t=this.constructor,r=t._$Eh.get(i);if(r!==void 0&&this._$Em!==r){let s=t.getPropertyOptions(r),a=typeof s.converter=="function"?{fromAttribute:s.converter}:s.converter?.fromAttribute!==void 0?s.converter:re;this._$Em=r;let d=a.fromAttribute(e,s.type);this[r]=d??this._$Ej?.get(r)??d,this._$Em=null}}requestUpdate(i,e,t,r=!1,s){if(i!==void 0){let a=this.constructor;if(r===!1&&(s=this[i]),t??=a.getPropertyOptions(i),!((t.hasChanged??De)(s,e)||t.useDefault&&t.reflect&&s===this._$Ej?.get(i)&&!this.hasAttribute(a._$Eu(i,t))))return;this.C(i,e,t)}this.isUpdatePending===!1&&(this._$ES=this._$EP())}C(i,e,{useDefault:t,reflect:r,wrapped:s},a){t&&!(this._$Ej??=new Map).has(i)&&(this._$Ej.set(i,a??e??this[i]),s!==!0||a!==void 0)||(this._$AL.has(i)||(this.hasUpdated||t||(e=void 0),this._$AL.set(i,e)),r===!0&&this._$Em!==i&&(this._$Eq??=new Set).add(i))}async _$EP(){this.isUpdatePending=!0;try{await this._$ES}catch(e){Promise.reject(e)}let i=this.scheduleUpdate();return i!=null&&await i,!this.isUpdatePending}scheduleUpdate(){return this.performUpdate()}performUpdate(){if(!this.isUpdatePending)return;if(!this.hasUpdated){if(this.renderRoot??=this.createRenderRoot(),this._$Ep){for(let[r,s]of this._$Ep)this[r]=s;this._$Ep=void 0}let t=this.constructor.elementProperties;if(t.size>0)for(let[r,s]of t){let{wrapped:a}=s,d=this[r];a!==!0||this._$AL.has(r)||d===void 0||this.C(r,void 0,s,d)}}let i=!1,e=this._$AL;try{i=this.shouldUpdate(e),i?(this.willUpdate(e),this._$EO?.forEach(t=>t.hostUpdate?.()),this.update(e)):this._$EM()}catch(t){throw i=!1,this._$EM(),t}i&&this._$AE(e)}willUpdate(i){}_$AE(i){this._$EO?.forEach(e=>e.hostUpdated?.()),this.hasUpdated||(this.hasUpdated=!0,this.firstUpdated(i)),this.updated(i)}_$EM(){this._$AL=new Map,this.isUpdatePending=!1}get updateComplete(){return this.getUpdateComplete()}getUpdateComplete(){return this._$ES}shouldUpdate(i){return!0}update(i){this._$Eq&&=this._$Eq.forEach(e=>this._$ET(e,this[e])),this._$EM()}updated(i){}firstUpdated(i){}};y.elementStyles=[],y.shadowRootOptions={mode:"open"},y[M("elementProperties")]=new Map,y[M("finalized")]=new Map,lt?.({ReactiveElement:y}),(V.reactiveElementVersions??=[]).push("2.1.2");var ce=globalThis,Ae=n=>n,Z=ce.trustedTypes,Me=Z?Z.createPolicy("lit-html",{createHTML:n=>n}):void 0,Ne="$lit$",$=`lit$${Math.random().toFixed(9).slice(2)}$`,Pe="?"+$,ct=`<${Pe}>`,E=document,I=()=>E.createComment(""),O=n=>n===null||typeof n!="object"&&typeof n!="function",he=Array.isArray,ht=n=>he(n)||typeof n?.[Symbol.iterator]=="function",ne=`[ 	
\f\r]`,R=/<(?:(!--|\/[^a-zA-Z])|(\/?[a-zA-Z][^>\s]*)|(\/?$))/g,Re=/-->/g,Ie=/>/g,x=RegExp(`>|${ne}(?:([^\\s"'>=/]+)(${ne}*=${ne}*(?:[^ 	
\f\r"'\`<>=]|("|')|))|$)`,"g"),Oe=/'/g,He=/"/g,Ue=/^(?:script|style|textarea|title)$/i,pe=n=>(i,...e)=>({_$litType$:n,strings:i,values:e}),l=pe(1),St=pe(2),Dt=pe(3),C=Symbol.for("lit-noChange"),h=Symbol.for("lit-nothing"),Le=new WeakMap,w=E.createTreeWalker(E,129);function ze(n,i){if(!he(n)||!n.hasOwnProperty("raw"))throw Error("invalid template strings array");return Me!==void 0?Me.createHTML(i):i}var pt=(n,i)=>{let e=n.length-1,t=[],r,s=i===2?"<svg>":i===3?"<math>":"",a=R;for(let d=0;d<e;d++){let o=n[d],c,m,p=-1,u=0;for(;u<o.length&&(a.lastIndex=u,m=a.exec(o),m!==null);)u=a.lastIndex,a===R?m[1]==="!--"?a=Re:m[1]!==void 0?a=Ie:m[2]!==void 0?(Ue.test(m[2])&&(r=RegExp("</"+m[2],"g")),a=x):m[3]!==void 0&&(a=x):a===x?m[0]===">"?(a=r??R,p=-1):m[1]===void 0?p=-2:(p=a.lastIndex-m[2].length,c=m[1],a=m[3]===void 0?x:m[3]==='"'?He:Oe):a===He||a===Oe?a=x:a===Re||a===Ie?a=R:(a=x,r=void 0);let g=a===x&&n[d+1].startsWith("/>")?" ":"";s+=a===R?o+ct:p>=0?(t.push(c),o.slice(0,p)+Ne+o.slice(p)+$+g):o+$+(p===-2?d:g)}return[ze(n,s+(n[e]||"<?>")+(i===2?"</svg>":i===3?"</math>":"")),t]},H=class n{constructor({strings:i,_$litType$:e},t){let r;this.parts=[];let s=0,a=0,d=i.length-1,o=this.parts,[c,m]=pt(i,e);if(this.el=n.createElement(c,t),w.currentNode=this.el.content,e===2||e===3){let p=this.el.content.firstChild;p.replaceWith(...p.childNodes)}for(;(r=w.nextNode())!==null&&o.length<d;){if(r.nodeType===1){if(r.hasAttributes())for(let p of r.getAttributeNames())if(p.endsWith(Ne)){let u=m[a++],g=r.getAttribute(p).split($),b=/([.?@])?(.*)/.exec(u);o.push({type:1,index:s,name:b[2],strings:g,ctor:b[1]==="."?ae:b[1]==="?"?oe:b[1]==="@"?de:T}),r.removeAttribute(p)}else p.startsWith($)&&(o.push({type:6,index:s}),r.removeAttribute(p));if(Ue.test(r.tagName)){let p=r.textContent.split($),u=p.length-1;if(u>0){r.textContent=Z?Z.emptyScript:"";for(let g=0;g<u;g++)r.append(p[g],I()),w.nextNode(),o.push({type:2,index:++s});r.append(p[u],I())}}}else if(r.nodeType===8)if(r.data===Pe)o.push({type:2,index:s});else{let p=-1;for(;(p=r.data.indexOf($,p+1))!==-1;)o.push({type:7,index:s}),p+=$.length-1}s++}}static createElement(i,e){let t=E.createElement("template");return t.innerHTML=i,t}};function k(n,i,e=n,t){if(i===C)return i;let r=t!==void 0?e._$Co?.[t]:e._$Cl,s=O(i)?void 0:i._$litDirective$;return r?.constructor!==s&&(r?._$AO?.(!1),s===void 0?r=void 0:(r=new s(n),r._$AT(n,e,t)),t!==void 0?(e._$Co??=[])[t]=r:e._$Cl=r),r!==void 0&&(i=k(n,r._$AS(n,i.values),r,t)),i}var se=class{constructor(i,e){this._$AV=[],this._$AN=void 0,this._$AD=i,this._$AM=e}get parentNode(){return this._$AM.parentNode}get _$AU(){return this._$AM._$AU}u(i){let{el:{content:e},parts:t}=this._$AD,r=(i?.creationScope??E).importNode(e,!0);w.currentNode=r;let s=w.nextNode(),a=0,d=0,o=t[0];for(;o!==void 0;){if(a===o.index){let c;o.type===2?c=new L(s,s.nextSibling,this,i):o.type===1?c=new o.ctor(s,o.name,o.strings,this,i):o.type===6&&(c=new le(s,this,i)),this._$AV.push(c),o=t[++d]}a!==o?.index&&(s=w.nextNode(),a++)}return w.currentNode=E,r}p(i){let e=0;for(let t of this._$AV)t!==void 0&&(t.strings!==void 0?(t._$AI(i,t,e),e+=t.strings.length-2):t._$AI(i[e])),e++}},L=class n{get _$AU(){return this._$AM?._$AU??this._$Cv}constructor(i,e,t,r){this.type=2,this._$AH=h,this._$AN=void 0,this._$AA=i,this._$AB=e,this._$AM=t,this.options=r,this._$Cv=r?.isConnected??!0}get parentNode(){let i=this._$AA.parentNode,e=this._$AM;return e!==void 0&&i?.nodeType===11&&(i=e.parentNode),i}get startNode(){return this._$AA}get endNode(){return this._$AB}_$AI(i,e=this){i=k(this,i,e),O(i)?i===h||i==null||i===""?(this._$AH!==h&&this._$AR(),this._$AH=h):i!==this._$AH&&i!==C&&this._(i):i._$litType$!==void 0?this.$(i):i.nodeType!==void 0?this.T(i):ht(i)?this.k(i):this._(i)}O(i){return this._$AA.parentNode.insertBefore(i,this._$AB)}T(i){this._$AH!==i&&(this._$AR(),this._$AH=this.O(i))}_(i){this._$AH!==h&&O(this._$AH)?this._$AA.nextSibling.data=i:this.T(E.createTextNode(i)),this._$AH=i}$(i){let{values:e,_$litType$:t}=i,r=typeof t=="number"?this._$AC(i):(t.el===void 0&&(t.el=H.createElement(ze(t.h,t.h[0]),this.options)),t);if(this._$AH?._$AD===r)this._$AH.p(e);else{let s=new se(r,this),a=s.u(this.options);s.p(e),this.T(a),this._$AH=s}}_$AC(i){let e=Le.get(i.strings);return e===void 0&&Le.set(i.strings,e=new H(i)),e}k(i){he(this._$AH)||(this._$AH=[],this._$AR());let e=this._$AH,t,r=0;for(let s of i)r===e.length?e.push(t=new n(this.O(I()),this.O(I()),this,this.options)):t=e[r],t._$AI(s),r++;r<e.length&&(this._$AR(t&&t._$AB.nextSibling,r),e.length=r)}_$AR(i=this._$AA.nextSibling,e){for(this._$AP?.(!1,!0,e);i!==this._$AB;){let t=Ae(i).nextSibling;Ae(i).remove(),i=t}}setConnected(i){this._$AM===void 0&&(this._$Cv=i,this._$AP?.(i))}},T=class{get tagName(){return this.element.tagName}get _$AU(){return this._$AM._$AU}constructor(i,e,t,r,s){this.type=1,this._$AH=h,this._$AN=void 0,this.element=i,this.name=e,this._$AM=r,this.options=s,t.length>2||t[0]!==""||t[1]!==""?(this._$AH=Array(t.length-1).fill(new String),this.strings=t):this._$AH=h}_$AI(i,e=this,t,r){let s=this.strings,a=!1;if(s===void 0)i=k(this,i,e,0),a=!O(i)||i!==this._$AH&&i!==C,a&&(this._$AH=i);else{let d=i,o,c;for(i=s[0],o=0;o<s.length-1;o++)c=k(this,d[t+o],e,o),c===C&&(c=this._$AH[o]),a||=!O(c)||c!==this._$AH[o],c===h?i=h:i!==h&&(i+=(c??"")+s[o+1]),this._$AH[o]=c}a&&!r&&this.j(i)}j(i){i===h?this.element.removeAttribute(this.name):this.element.setAttribute(this.name,i??"")}},ae=class extends T{constructor(){super(...arguments),this.type=3}j(i){this.element[this.name]=i===h?void 0:i}},oe=class extends T{constructor(){super(...arguments),this.type=4}j(i){this.element.toggleAttribute(this.name,!!i&&i!==h)}},de=class extends T{constructor(i,e,t,r,s){super(i,e,t,r,s),this.type=5}_$AI(i,e=this){if((i=k(this,i,e,0)??h)===C)return;let t=this._$AH,r=i===h&&t!==h||i.capture!==t.capture||i.once!==t.once||i.passive!==t.passive,s=i!==h&&(t===h||r);r&&this.element.removeEventListener(this.name,this,t),s&&this.element.addEventListener(this.name,this,i),this._$AH=i}handleEvent(i){typeof this._$AH=="function"?this._$AH.call(this.options?.host??this.element,i):this._$AH.handleEvent(i)}},le=class{constructor(i,e,t){this.element=i,this.type=6,this._$AN=void 0,this._$AM=e,this.options=t}get _$AU(){return this._$AM._$AU}_$AI(i){k(this,i)}};var ut=ce.litHtmlPolyfillSupport;ut?.(H,L),(ce.litHtmlVersions??=[]).push("3.3.3");var Fe=(n,i,e)=>{let t=e?.renderBefore??i,r=t._$litPart$;if(r===void 0){let s=e?.renderBefore??null;t._$litPart$=r=new L(i.insertBefore(I(),s),s,void 0,e??{})}return r._$AI(n),r};var ue=globalThis,f=class extends y{constructor(){super(...arguments),this.renderOptions={host:this},this._$Do=void 0}createRenderRoot(){let i=super.createRenderRoot();return this.renderOptions.renderBefore??=i.firstChild,i}update(i){let e=this.render();this.hasUpdated||(this.renderOptions.isConnected=this.isConnected),super.update(i),this._$Do=Fe(e,this.renderRoot,this.renderOptions)}connectedCallback(){super.connectedCallback(),this._$Do?.setConnected(!0)}disconnectedCallback(){super.disconnectedCallback(),this._$Do?.setConnected(!1)}render(){return C}};f._$litElement$=!0,f.finalized=!0,ue.litElementHydrateSupport?.({LitElement:f});var mt=ue.litElementPolyfillSupport;mt?.({LitElement:f});(ue.litElementVersions??=[]).push("4.2.2");var me="calendar.btoddb_reminders",Q=14,ge="/calendar?view=dayGridMonth",fe=365,We=6e4,Ye="btoddb-ha-reminders-reminders-changed";function G(n,i,e,t){let r=Number(n);return Number.isFinite(r)?Math.max(e,Math.min(t,Math.floor(r))):i}function U(n,i){return n===!0?"always":n===!1?"never":n==="always"||n==="never"||n==="auto"?n:i}function _e(n,i){return n===!0?"always":n===!1?"never":n==="always"||n==="never"||n==="auto"?n:i}function gt(n){return typeof n!="string"?ge:n.trim()||ge}function ft(n){let[i,e,t]=n.split("-").map(Number);return new Date(i,e-1,t)}function je(n){if(!n)return null;if(n.dateTime){let i=new Date(n.dateTime);return Number.isNaN(i.getTime())?null:i}return n.date?ft(n.date):null}function _(n){return`${n.getFullYear()}-${n.getMonth()}-${n.getDate()}`}function qe(n){let i=new Date(n);return i.setHours(0,0,0,0),i}function Ke(n){let i=new Date(n);return i.setDate(i.getDate()+1),i}function Be(n){let i=new Date(n);return i.setDate(i.getDate()-1),i}function _t(n,i){return n.getTime()>i.getTime()?n:i}function vt(n,i){return n.getTime()<i.getTime()?n:i}function yt(n,i){return!i||i.getTime()<=n.getTime()?n:new Date(i.getTime()-1)}function bt(n){let i=new Set;return n.filter(e=>{let t=`${e.dedupeKey}|${_(e.displayDate)}`;return i.has(t)?!1:(i.add(t),!0)})}var N=class extends f{constructor(){super(...arguments);this._config={type:""}}setConfig(e){this._config=e??{type:""}}_entities(){let e=this._config.entities;return e?e.map(t=>typeof t=="string"?t:t.entity).filter(t=>!!t):[me]}_fireConfigChanged(e){this._config=e,this.dispatchEvent(new CustomEvent("config-changed",{detail:{config:e},bubbles:!0,composed:!0}))}_titleChanged(e){let t=e.target.value;this._fireConfigChanged({...this._config,title:t})}_dashboardPathChanged(e){let t=e.target.value.trim();this._fireConfigChanged({...this._config,dashboard_path:t||void 0})}_daysChanged(e){let t=G(e.target.value,Q,1,fe);this._fireConfigChanged({...this._config,days:t})}_maxItemsChanged(e){let t=G(e.target.value,0,0,500);this._fireConfigChanged({...this._config,max_items:t})}_hideEndTimeChanged(e){let t=U(e.target.value,"auto");this._fireConfigChanged({...this._config,hide_end_time:t})}_showCalendarNameChanged(e){let t=_e(e.target.value,"auto");this._fireConfigChanged({...this._config,show_calendar_name:t})}_entityChanged(e,t){let r=t.detail.value??"",s=this._entities();r?s[e]=r:e<s.length&&s.splice(e,1),this._fireConfigChanged({...this._config,entities:s})}_removeEntity(e){let t=this._entities();t.splice(e,1),this._fireConfigChanged({...this._config,entities:t})}render(){if(!this.hass||!this._config)return l``;let e=this._entities(),t=[...e,""],r=this._config.days??Q,s=U(this._config.hide_end_time,"auto"),a=_e(this._config.show_calendar_name,"auto"),d=this._config.max_items??0;return l`
      <div class="card-config">
        <input
          class="field"
          type="text"
          placeholder="Title (optional)"
          .value=${this._config.title??""}
          @change=${this._titleChanged}
        />

        <label>
          <span>Dashboard path</span>
          <input
            class="field"
            type="text"
            placeholder=${ge}
            .value=${this._config.dashboard_path??""}
            @change=${this._dashboardPathChanged}
          />
        </label>

        <div class="entity-list">
          ${t.map((o,c)=>l`
              <div class="entity-row">
                <ha-entity-picker
                  .hass=${this.hass}
                  .value=${o}
                  .label=${c<e.length?"Calendar":"Add calendar"}
                  .includeDomains=${["calendar"]}
                  @value-changed=${m=>this._entityChanged(c,m)}
                ></ha-entity-picker>
                ${c<e.length?l`
                      <ha-icon-button
                        .label=${"Remove calendar"}
                        @click=${()=>this._removeEntity(c)}
                      >
                        <ha-icon icon="mdi:delete-outline"></ha-icon>
                      </ha-icon-button>
                    `:h}
              </div>
            `)}
        </div>

        <label>
          <span>Days</span>
          <input
            class="field"
            type="number"
            min="1"
            max=${fe}
            .value=${String(r)}
            @change=${this._daysChanged}
          />
        </label>

        <label>
          <span>Hide end time</span>
          <select
            class="field"
            .value=${s}
            @change=${this._hideEndTimeChanged}
          >
            <option value="auto">Auto</option>
            <option value="always">Always</option>
            <option value="never">Never</option>
          </select>
        </label>

        <label>
          <span>Calendar name</span>
          <select
            class="field"
            .value=${a}
            @change=${this._showCalendarNameChanged}
          >
            <option value="auto">Auto</option>
            <option value="always">Always</option>
            <option value="never">Never</option>
          </select>
        </label>

        <label>
          <span>Max items</span>
          <input
            class="field"
            type="number"
            min="0"
            max="500"
            .value=${String(d)}
            @change=${this._maxItemsChanged}
          />
        </label>
      </div>
    `}};N.properties={hass:{attribute:!1},_config:{state:!0}},N.styles=v`
    .card-config {
      display: flex;
      flex-direction: column;
      gap: 16px;
      padding: 16px;
    }
    .entity-list {
      display: flex;
      flex-direction: column;
      gap: 8px;
    }
    .entity-row {
      display: flex;
      align-items: center;
      gap: 8px;
    }
    .entity-row ha-entity-picker {
      flex: 1 1 auto;
      min-width: 0;
    }
    label {
      display: flex;
      flex-direction: column;
      gap: 6px;
      color: var(--secondary-text-color, #727272);
      font-size: 12px;
      font-weight: 500;
    }
    .field,
    ha-entity-picker {
      width: 100%;
    }
    .field {
      height: 40px;
      padding: 0 8px;
      border: 1px solid var(--divider-color, #e0e0e0);
      border-radius: 4px;
      background: var(--card-background-color, #fff);
      color: var(--primary-text-color, #212121);
      color-scheme: light dark;
      font-family: inherit;
      font-size: 14px;
      box-sizing: border-box;
    }
  `;customElements.define("btoddb-calendar-list-card-editor",N);var P=class extends f{constructor(){super(...arguments);this._config={type:""};this._entries=[];this._error="";this._loading=!1;this._lastSignature="";this._reminderRefreshTimers=[];this._handleRemindersChanged=e=>{let t=e.detail?.entity;t&&this._entities().some(({entity:r})=>r===t)&&this._scheduleReminderRefresh()}}static getConfigElement(){return document.createElement("btoddb-calendar-list-card-editor")}static getStubConfig(){return{entities:[me],days:Q,hide_end_time:"auto"}}setConfig(e){this._config=e??{type:""},this._lastSignature="",this.hass&&this._fetch()}getCardSize(){return 2+Math.min(this._entries.length,8)}connectedCallback(){super.connectedCallback(),this._refreshTimer=window.setInterval(()=>this._fetch(),6e4),window.addEventListener(Ye,this._handleRemindersChanged)}disconnectedCallback(){super.disconnectedCallback(),this._refreshTimer&&window.clearInterval(this._refreshTimer),window.removeEventListener(Ye,this._handleRemindersChanged),this._clearReminderRefreshTimers()}updated(e){if(!e.has("hass")||!this.hass)return;let t=this._entities().map(({entity:r})=>{let s=this.hass.states[r];return s?`${r}:${s.state}|${s.last_updated}`:`${r}:missing`}).join(";");t!==this._lastSignature&&(this._lastSignature=t,this._fetch())}_entities(){let e=this._config.entities;return(e===void 0?[me]:e).map(r=>typeof r=="string"?{entity:r}:{entity:r.entity,hide_end_time:r.hide_end_time===void 0?void 0:U(r.hide_end_time,"auto")}).filter(r=>!!r.entity)}_days(){return G(this._config.days,Q,1,fe)}_maxItems(){return G(this._config.max_items,0,0,500)}_globalHideEndTime(){return U(this._config.hide_end_time,"auto")}_showCalendarNameMode(){return _e(this._config.show_calendar_name,"auto")}_clearReminderRefreshTimers(){for(let e of this._reminderRefreshTimers)window.clearTimeout(e);this._reminderRefreshTimers=[]}_scheduleReminderRefresh(){this._clearReminderRefreshTimers();for(let e of[0,1e3,3e3])this._reminderRefreshTimers.push(window.setTimeout(()=>{this._fetch()},e))}async _fetch(){if(!this.hass)return;let e=this._entities();if(e.length===0){this._entries=[],this._error="No calendar entities configured. Edit the card to select one.";return}let t=e.filter(({entity:o})=>!this.hass.states[o]),r=e.filter(({entity:o})=>!!this.hass.states[o]);if(r.length===0){this._entries=[],this._error=t.map(({entity:o})=>`Entity ${o} not found.`).join(" ");return}let s=new Date;s.setHours(0,0,0,0);let a=new Date(s);a.setDate(s.getDate()+this._days());let d=Date.now()-We;this._loading=!0;try{let o=await Promise.all(r.map(async u=>{try{let g=await this.hass.callApi("GET",`calendars/${u.entity}?start=${encodeURIComponent(s.toISOString())}&end=${encodeURIComponent(a.toISOString())}`);return{entries:this._normalizeEvents(g??[],u,s,a),error:""}}catch(g){return{entries:[],error:`Could not load ${u.entity}: ${this._msg(g)}`}}})),c=o.flatMap(u=>u.entries).filter(u=>(u.end??u.start).getTime()>=d).sort((u,g)=>{let b=u.displayDate.getTime()-g.displayDate.getTime();if(_(u.displayDate)!==_(g.displayDate))return b;if(u.allDay!==g.allDay)return u.allDay?-1:1;let S=Math.max(u.start.getTime(),u.displayDate.getTime()),D=Math.max(g.start.getTime(),g.displayDate.getTime());return S!==D?S-D:u.summary.localeCompare(g.summary)});c=bt(c);let m=this._maxItems();m>0&&(c=c.slice(0,m));let p=[...t.map(({entity:u})=>`Entity ${u} not found.`),...o.map(u=>u.error).filter(Boolean)];this._entries=c,this._error=p.join(" ")}finally{this._loading=!1}}_normalizeEvents(e,t,r,s){let d=this.hass.states[t.entity]?.attributes?.friendly_name??t.entity;return e.flatMap((o,c)=>{let m=je(o.start);if(!m)return[];let p=je(o.end),u=o.uid??`${t.entity}-${m.toISOString()}-${o.summary??c}`,g=o.uid?`${t.entity}|uid:${o.uid}`:[t.entity,"event",o.summary||"(No title)",m.toISOString(),p?.toISOString()??""].join("|"),b={uid:u,dedupeKey:g,summary:o.summary||"(No title)",start:m,end:p,allDay:!!o.start.date,calendar:t.entity,calendarName:d,hideEndTime:t.hide_end_time===void 0?void 0:U(t.hide_end_time,"auto")},S=_t(qe(m),r),D=vt(qe(yt(m,p)),Be(s));if(S.getTime()>D.getTime())return[];let we=[];for(let q=S;q.getTime()<=D.getTime();q=Ke(q))we.push({...b,displayDate:q});return we})}_msg(e){return e&&typeof e=="object"&&"message"in e?String(e.message):String(e)}_formatTimeOnly(e){try{return e.toLocaleString(void 0,{hour:"numeric",minute:"2-digit"})}catch{return e.toLocaleString()}}_formatDate(e){try{return e.toLocaleDateString(void 0,{month:"short",day:"numeric"})}catch{return e.toLocaleDateString()}}_formatDateTime(e){try{return e.toLocaleString(void 0,{month:"short",day:"numeric",hour:"numeric",minute:"2-digit"})}catch{return e.toLocaleString()}}_formatDayHeader(e){let t=new Date;if(_(e)===_(t))return"Today";let r=Ke(t);if(_(e)===_(r))return"Tomorrow";try{return e.toLocaleDateString(void 0,{weekday:"long",month:"short",day:"numeric"})}catch{return e.toLocaleDateString()}}_durationMs(e){return e.end?e.end.getTime()-e.start.getTime():0}_shouldHideEndTime(e){if(e.allDay)return!0;let t=e.hideEndTime??this._globalHideEndTime();return t==="always"?!0:t==="never"?!1:this._durationMs(e)<=We}_formatEntryTime(e){if(e.allDay){if(!e.end)return"All day";let t=Be(e.end);return _(t)===_(e.start)?"All day":`All day, ${this._formatDate(e.start)} - ${this._formatDate(t)}`}return!e.end||this._shouldHideEndTime(e)?this._formatTimeOnly(e.start):_(e.start)===_(e.end)?`${this._formatTimeOnly(e.start)} - ${this._formatTimeOnly(e.end)}`:`${this._formatDateTime(e.start)} - ${this._formatDateTime(e.end)}`}_shouldShowCalendarName(){let e=this._showCalendarNameMode();return e==="always"?!0:e==="never"?!1:this._entities().length>1}_openCalendarDashboard(){window.history.pushState(null,"",gt(this._config.dashboard_path)),window.dispatchEvent(new CustomEvent("location-changed",{detail:{replace:!1}}))}_handleCardKeydown(e){e.key!=="Enter"&&e.key!==" "||(e.preventDefault(),this._openCalendarDashboard())}_renderRows(){let e=[],t="";for(let r of this._entries){let s=_(r.displayDate);s!==t&&(e.push(l`<div class="day-header">${this._formatDayHeader(r.displayDate)}</div>`),t=s),e.push(this._renderEntry(r))}return e}_renderEntry(e){let t=this._shouldShowCalendarName();return l`
      <div class="item">
        <ha-icon
          class="leading"
          icon=${e.allDay?"mdi:calendar-blank":"mdi:calendar-clock"}
        ></ha-icon>
        <div class="text">
          <span class="summary">${e.summary}</span>
          <span class="time">${this._formatEntryTime(e)}</span>
          ${t?l`<span class="calendar-name">${e.calendarName}</span>`:h}
        </div>
      </div>
    `}render(){let e=this._config.title??"Agenda";return l`
      <ha-card
        .header=${e}
        role="button"
        tabindex="0"
        @click=${this._openCalendarDashboard}
        @keydown=${this._handleCardKeydown}
      >
        <div class="content">
          ${this._error?l`<div class="error">${this._error}</div>`:h}
          ${this._entries.length===0?l`<div class="empty">
                ${this._loading?"Loading events...":"No upcoming events."}
              </div>`:l`<div class="list">${this._renderRows()}</div>`}
        </div>
      </ha-card>
    `}};P.properties={hass:{attribute:!1},_config:{state:!0},_entries:{state:!0},_error:{state:!0},_loading:{state:!0}},P.styles=v`
    .content {
      padding: 0 16px 12px;
    }
    ha-card {
      cursor: pointer;
    }
    ha-card:focus-visible {
      outline: 2px solid var(--primary-color, #03a9f4);
      outline-offset: 2px;
    }
    .error {
      margin: 12px 0 0;
      padding: 8px;
      border-radius: 4px;
      background: var(--error-color, #db4437);
      color: white;
      font-size: 13px;
    }
    .empty {
      padding: 18px 0 8px;
      color: var(--secondary-text-color, #727272);
      font-size: 14px;
    }
    .list {
      padding-top: 8px;
    }
    .day-header {
      padding: 14px 0 6px;
      color: var(--secondary-text-color, #727272);
      font-size: 12px;
      font-weight: 600;
      letter-spacing: 0;
      text-transform: uppercase;
    }
    .item {
      display: flex;
      align-items: center;
      gap: 12px;
      min-height: 44px;
      padding: 8px 0;
      border-top: 1px solid var(--divider-color, #e0e0e0);
    }
    .leading {
      flex: 0 0 auto;
      color: var(--primary-color, #03a9f4);
    }
    .text {
      min-width: 0;
      flex: 1 1 auto;
      display: flex;
      flex-direction: column;
      gap: 2px;
    }
    .summary {
      overflow-wrap: anywhere;
      color: var(--primary-text-color, #212121);
      font-size: 14px;
      line-height: 1.3;
    }
    .time,
    .calendar-name {
      color: var(--secondary-text-color, #727272);
      font-size: 12px;
      line-height: 1.3;
    }
  `;customElements.define("btoddb-calendar-list-card",P);var $t="calendar.btoddb_reminders",xt="btoddb-ha-reminders-reminders-changed",ve="sensor.btoddb_location_reminders",Ve="btoddb_ha_reminders_location",Ze=[{code:"SU",label:"S"},{code:"MO",label:"M"},{code:"TU",label:"T"},{code:"WE",label:"W"},{code:"TH",label:"T"},{code:"FR",label:"F"},{code:"SA",label:"S"}],J={MO:"Monday",TU:"Tuesday",WE:"Wednesday",TH:"Thursday",FR:"Friday",SA:"Saturday",SU:"Sunday"},Qe={SU:0,MO:1,TU:2,WE:3,TH:4,FR:5,SA:6},X=n=>String(n).padStart(2,"0");function z(n){return`${n.getFullYear()}-${X(n.getMonth()+1)}-${X(n.getDate())}T${X(n.getHours())}:${X(n.getMinutes())}`}function ye(){let n=new Date;return n.setHours(n.getHours()+1,0,0,0),z(n)}var F=class extends f{constructor(){super(...arguments);this._config={type:""}}setConfig(e){this._config=e}_titleChanged(e){let t=e.target.value;this._fireConfigChanged({...this._config,title:t})}_entityChanged(e){let t=e.detail.value;this._fireConfigChanged({...this._config,entity:t})}_fireConfigChanged(e){this._config=e,this.dispatchEvent(new CustomEvent("config-changed",{detail:{config:e},bubbles:!0,composed:!0}))}render(){return!this.hass||!this._config?l``:l`
      <div class="card-config">
        <input
          class="title-field"
          type="text"
          placeholder="Title (optional)"
          .value=${this._config.title??""}
          @change=${this._titleChanged}
        />
        <ha-entity-picker
          .hass=${this.hass}
          .value=${this._config.entity??""}
          .label=${"Calendar entity"}
          .includeDomains=${["calendar"]}
          @value-changed=${this._entityChanged}
        ></ha-entity-picker>
      </div>
    `}};F.properties={hass:{attribute:!1},_config:{state:!0}},F.styles=v`
    .card-config {
      display: flex;
      flex-direction: column;
      gap: 16px;
      padding: 16px;
    }
    .title-field,
    ha-entity-picker {
      width: 100%;
    }
    .title-field {
      height: 40px;
      padding: 0 8px;
      border: 1px solid var(--divider-color, #e0e0e0);
      border-radius: 4px;
      background: var(--card-background-color, #fff);
      color: var(--primary-text-color, #212121);
      color-scheme: light dark;
      font-family: inherit;
      font-size: 14px;
      box-sizing: border-box;
    }
  `;customElements.define("btoddb-reminders-card-editor",F);var W=class extends f{constructor(){super(...arguments);this._config={type:""};this._items=[];this._mode="time";this._message="";this._when=ye();this._repeatOpen=!1;this._freq="daily";this._weekday="MO";this._interval=1;this._monthMode="day";this._monthDay=1;this._monthOrdinal="1";this._monthWeekday="MO";this._locMessage="";this._locPerson="";this._locZone="";this._locTrigger="enter";this._locPersistent=!1;this._busy=!1;this._error="";this._editingUid="";this._timeCollapsed=!1;this._locationCollapsed=!1;this._entity=$t;this._lastSignature=""}static getConfigElement(){return document.createElement("btoddb-reminders-card-editor")}static getStubConfig(){return{}}setConfig(e){this._config=e??{type:""},this._entity=e?.entity??""}getCardSize(){let e=this._locationItems().length,t=this._items.length?this._timeCollapsed?1:this._items.length:0,r=e?this._locationCollapsed?1:e:0;return 3+Math.min(t+r,8)}connectedCallback(){super.connectedCallback(),this._refreshTimer=window.setInterval(()=>this._fetch(),6e4)}disconnectedCallback(){super.disconnectedCallback(),this._refreshTimer&&window.clearInterval(this._refreshTimer)}updated(e){if(!e.has("hass")||!this.hass)return;let t=this.hass.states[this._entity],r=t?`${t.state}|${t.last_updated}`:"missing";r!==this._lastSignature&&(this._lastSignature=r,this._fetch())}async _fetch(){if(!this.hass)return;if(!this._entity){this._error="No calendar entity configured. Edit the card to select one.",this._items=[];return}if(!this.hass.states[this._entity]){this._error=`Entity ${this._entity} not found. Is the Reminders integration set up?`,this._items=[];return}let e=new Date;e.setHours(0,0,0,0);let t=new Date;t.setFullYear(t.getFullYear()+1);try{let r=await this.hass.callApi("GET",`calendars/${this._entity}?start=${encodeURIComponent(e.toISOString())}&end=${encodeURIComponent(t.toISOString())}`),s=Date.now()-6e4,a=new Set;this._items=(r??[]).map(d=>({kind:"time",uid:d.uid??"",summary:d.summary,start:new Date(d.start.dateTime??d.start.date??""),rrule:d.description??""})).filter(d=>d.start.getTime()>=s||d.rrule!=="").sort((d,o)=>d.start.getTime()-o.start.getTime()).filter(d=>d.rrule?a.has(d.uid)?!1:(a.add(d.uid),!0):!0),this._error=""}catch(r){this._error=`Could not load reminders: ${this._msg(r)}`}}_buildRrule(){if(!this._repeatOpen)return"";let e=this._interval>1?`;INTERVAL=${this._interval}`:"";return this._freq==="daily"?`FREQ=DAILY${e}`:this._freq==="weekly"?`FREQ=WEEKLY;BYDAY=${this._weekday}${e}`:this._monthMode==="weekday"?`FREQ=MONTHLY;BYDAY=${this._monthOrdinal}${this._monthWeekday}${e}`:`FREQ=MONTHLY;BYMONTHDAY=${this._monthDay===-1?"-1":String(this._monthDay)}${e}`}_adjustToMonthWeekday(e,t,r){let s=new Date(e),a=Qe[r]??1,d=new Date(s.getFullYear(),s.getMonth()+1,0).getDate(),o=1;if(t==="-1"){for(let c=d;c>=1;c--)if(new Date(s.getFullYear(),s.getMonth(),c).getDay()===a){o=c;break}}else{let c=parseInt(t,10),m=0;for(let p=1;p<=d;p++)if(new Date(s.getFullYear(),s.getMonth(),p).getDay()===a&&++m===c){o=p;break}}return s.setDate(o),z(s)}_adjustToMonthDay(e,t){let r=new Date(e),s=new Date(r.getFullYear(),r.getMonth()+1,0).getDate();return r.setDate(t===-1?s:Math.min(t,s)),z(r)}_adjustToWeekday(e,t){let r=Qe[t]??1,s=new Date(e),a=s.getDay(),d=(r-a+7)%7;return s.setDate(s.getDate()+d),z(s)}_notifyTimeRemindersChanged(){window.dispatchEvent(new CustomEvent(xt,{detail:{entity:this._entity}}))}async _add(){let e=this._message.trim();if(!e){this._error="Enter a reminder message.";return}if(!this._when){this._error="Pick a date and time.";return}let t=this._editingUid,r=this._buildRrule(),s=this._when;r&&this._freq==="weekly"?s=this._adjustToWeekday(s,this._weekday):r&&this._freq==="monthly"&&(this._monthMode==="weekday"?s=this._adjustToMonthWeekday(s,this._monthOrdinal,this._monthWeekday):s=this._adjustToMonthDay(s,this._monthDay));let a={message:e,when:s};r&&(a.rrule=r),t&&!r&&(a.rrule=null),this._busy=!0,this._error="";try{t?(await this.hass.callService("btoddb_ha_reminders","update",{uid:t,...a},void 0,void 0,!0),this._editingUid=""):await this.hass.callService("btoddb_ha_reminders","create",a,void 0,void 0,!0),this._message="",this._when=ye(),this._repeatOpen=!1,this._freq="daily",this._weekday="MO",this._interval=1,this._monthMode="day",this._monthDay=1,this._monthOrdinal="1",this._monthWeekday="MO",t||(this._timeCollapsed=!1),await this._fetch(),this._notifyTimeRemindersChanged()}catch(d){this._error=`Could not ${t?"update":"create"} reminder: ${this._msg(d)}`}finally{this._busy=!1}}async _delete(e){if(e)try{await this.hass.callWS({type:"calendar/event/delete",entity_id:this._entity,uid:e}),this._items=this._items.filter(t=>t.uid!==e),this._notifyTimeRemindersChanged()}catch(t){this._error=`Could not delete reminder: ${this._msg(t)}`}}async _addLocation(){let e=this._locMessage.trim();if(!e){this._error="Enter a reminder message.";return}if(!this._locPerson){this._error="Pick a person to track.";return}if(!this._locZone){this._error="Pick a zone.";return}let t=this._editingUid;this._busy=!0,this._error="";try{t?(await this.hass.callService("btoddb_ha_reminders","update_location",{uid:t,message:e,person:this._locPerson,zone:this._locZone,trigger:this._locTrigger,persistent:this._locPersistent}),this._editingUid=""):await this.hass.callService("btoddb_ha_reminders","create_location",{message:e,person:this._locPerson,zone:this._locZone,trigger:this._locTrigger,persistent:this._locPersistent}),this._locMessage="",this._locPerson="",this._locZone="",this._locTrigger="enter",this._locPersistent=!1,t||(this._locationCollapsed=!1)}catch(r){this._error=`Could not ${t?"update":"create"} reminder: ${this._msg(r)}`}finally{this._busy=!1}}_startEditTime(e){if(this._editingUid=e.uid,this._mode="time",this._message=e.summary,this._when=z(e.start),e.rrule){this._repeatOpen=!0;let t=e.rrule.toUpperCase(),r=t.match(/INTERVAL=(\d+)/);if(this._interval=r?parseInt(r[1],10):1,t.includes("FREQ=WEEKLY")){this._freq="weekly";let s=t.match(/BYDAY=(\w+)/);this._weekday=s?s[1]:"MO",this._monthMode="day",this._monthDay=1,this._monthOrdinal="1",this._monthWeekday="MO"}else if(t.includes("FREQ=MONTHLY")){this._freq="monthly";let s=t.match(/BYDAY=(-?[1-4])(MO|TU|WE|TH|FR|SA|SU)/);if(s)this._monthMode="weekday",this._monthOrdinal=s[1],this._monthWeekday=s[2],this._monthDay=1;else{this._monthMode="day";let a=t.match(/BYMONTHDAY=(-?\d+)/);this._monthDay=a?parseInt(a[1],10):e.start.getDate(),this._monthOrdinal="1",this._monthWeekday="MO"}this._weekday="MO"}else this._freq="daily",this._weekday="MO",this._monthMode="day",this._monthDay=1,this._monthOrdinal="1",this._monthWeekday="MO"}else this._repeatOpen=!1,this._freq="daily",this._weekday="MO",this._interval=1,this._monthMode="day",this._monthDay=1,this._monthOrdinal="1",this._monthWeekday="MO";this._error=""}_startEditLocation(e){this._editingUid=e.uid,this._mode="location",this._locMessage=e.summary,this._locPerson=e.person,this._locZone=e.zone,this._locTrigger=e.trigger,this._locPersistent=e.persistent,this._error=""}_cancelEdit(){this._editingUid="",this._message="",this._when=ye(),this._repeatOpen=!1,this._freq="daily",this._weekday="MO",this._interval=1,this._monthMode="day",this._monthDay=1,this._monthOrdinal="1",this._monthWeekday="MO",this._locMessage="",this._locPerson="",this._locZone="",this._locTrigger="enter",this._locPersistent=!1,this._error=""}async _deleteLocation(e){if(e)try{await this.hass.callService("btoddb_ha_reminders","delete_location",{uid:e})}catch(t){this._error=`Could not delete reminder: ${this._msg(t)}`}}_locationSensorId(){let e=this.hass?.states??{};if(e[ve]?.attributes?.[Ve])return ve;for(let[t,r]of Object.entries(e))if(t.startsWith("sensor.")&&r.attributes?.[Ve])return t;return ve}_locationItems(){return(this.hass?.states[this._locationSensorId()]?.attributes?.reminders??[]).map(r=>({kind:"location",uid:r.uid,summary:r.summary,person:r.person,zone:r.zone,trigger:r.trigger,persistent:r.persistent??!1,deliveredAt:r.delivered_at?new Date(r.delivered_at):null}))}_entityName(e){return this.hass?.states[e]?.attributes?.friendly_name??e}_msg(e){return e&&typeof e=="object"&&"message"in e?String(e.message):String(e)}_formatTime(e){try{return e.toLocaleString(void 0,{weekday:"short",month:"short",day:"numeric",hour:"numeric",minute:"2-digit"})}catch{return e.toLocaleString()}}_formatTimeOnly(e){try{return e.toLocaleString(void 0,{hour:"numeric",minute:"2-digit"})}catch{return e.toLocaleString()}}_dayKey(e){return`${e.getFullYear()}-${e.getMonth()}-${e.getDate()}`}_formatDayHeader(e){let t=new Date;if(this._dayKey(e)===this._dayKey(t))return"Today";let r=new Date(t);if(r.setDate(t.getDate()+1),this._dayKey(e)===this._dayKey(r))return"Tomorrow";try{return e.toLocaleDateString(void 0,{weekday:"long",month:"short",day:"numeric"})}catch{return e.toLocaleDateString()}}_renderDayHeader(e){return l`<div class="day-header">${this._formatDayHeader(e)}</div>`}_intervalPrefix(e){let t=e.match(/INTERVAL=(\d+)/),r=t?parseInt(t[1],10):1;if(r<=1)return"Every";if(r===2)return"Every other";let s=r%100>=11&&r%100<=13?"th":{1:"st",2:"nd",3:"rd"}[r%10]??"th";return`Every ${r}${s}`}_formatRecurrence(e,t){let r=t.toLocaleString(void 0,{hour:"numeric",minute:"2-digit"}),s=e.toUpperCase(),a=this._intervalPrefix(s);if(s.includes("FREQ=DAILY"))return`${a} day at ${r}`;if(s.includes("FREQ=WEEKLY")){let d=s.match(/BYDAY=(\w+)/);if(d){let o=J[d[1]]??d[1];return`${a} ${o} at ${r}`}return`${a==="Every"?"Weekly":`${a} week`} at ${r}`}if(s.includes("FREQ=MONTHLY")){let d=s.match(/BYDAY=(-1|[1-4])(MO|TU|WE|TH|FR|SA|SU)/);if(d){let u={1:"first",2:"second",3:"third",4:"fourth","-1":"last"}[d[1]]??d[1],g=J[d[2]]??d[2];return`${a} month on the ${u} ${g} at ${r}`}let o=s.match(/BYMONTHDAY=(-?\d+)/);if(o&&o[1]==="-1")return`${a} month on the last day at ${r}`;let c=o?parseInt(o[1],10):t.getDate(),m=c%100>=11&&c%100<=13?"th":{1:"st",2:"nd",3:"rd"}[c%10]??"th";return`${a} month on the ${c}${m} at ${r}`}return e}_renderSwitch(e,t){return l`
      <label class="repeat-switch">
        <input
          type="checkbox"
          role="switch"
          .checked=${e}
          @change=${r=>t(r.target.checked)}
        />
        <span class="repeat-switch-track"
          ><span class="repeat-switch-thumb"></span
        ></span>
        <span class="repeat-switch-label">Repeat</span>
      </label>
    `}_renderRepeatDisclosure(){return l`
      <div class="repeat-row">
        ${this._renderSwitch(this._repeatOpen,e=>{this._repeatOpen=e})}
        ${this._repeatOpen?l`
              <div class="repeat-body">
                <select
                  class="freq-select"
                  .value=${this._freq}
                  @change=${e=>{this._freq=e.target.value}}
                >
                  <option value="daily">Daily</option>
                  <option value="weekly">Weekly</option>
                  <option value="monthly">Monthly</option>
                </select>
                <span class="interval-label">every</span>
                <input
                  class="interval-input"
                  type="number"
                  min="1"
                  .value=${String(this._interval)}
                  @input=${e=>{let t=parseInt(e.target.value,10);this._interval=Number.isFinite(t)&&t>=1?t:1}}
                />
                <span class="interval-label"
                  >${this._freq==="daily"?"day(s)":this._freq==="weekly"?"week(s)":"month(s)"}</span
                >
                ${this._freq==="weekly"?l`
                      <div class="weekday-chips">
                        ${Ze.map(({code:e,label:t})=>l`
                            <button
                              type="button"
                              class="chip ${this._weekday===e?"selected":""}"
                              title=${J[e]??e}
                              @click=${()=>{this._weekday=e}}
                            >
                              ${t}
                            </button>
                          `)}
                      </div>
                    `:h}
                ${this._freq==="monthly"?l`
                      <div class="month-opts">
                        <select
                          class="month-mode-select"
                          .value=${this._monthMode}
                          @change=${e=>{this._monthMode=e.target.value}}
                        >
                          <option value="day">Day of month</option>
                          <option value="weekday">Day of week</option>
                        </select>
                        ${this._monthMode==="day"?l`
                              <select
                                class="month-day-select"
                                .value=${String(this._monthDay)}
                                @change=${e=>{this._monthDay=parseInt(e.target.value,10)}}
                              >
                                ${Array.from({length:28},(e,t)=>t+1).map(e=>l`<option
                                    value=${e}
                                    ?selected=${this._monthDay===e}
                                  >
                                    ${e}
                                  </option>`)}
                                <option value="-1" ?selected=${this._monthDay===-1}>
                                  Last day
                                </option>
                              </select>
                            `:l`
                              <select
                                class="month-ordinal-select"
                                .value=${this._monthOrdinal}
                                @change=${e=>{this._monthOrdinal=e.target.value}}
                              >
                                <option value="1">First</option>
                                <option value="2">Second</option>
                                <option value="3">Third</option>
                                <option value="4">Fourth</option>
                                <option value="-1">Last</option>
                              </select>
                              <div class="weekday-chips">
                                ${Ze.map(({code:e,label:t})=>l`
                                    <button
                                      type="button"
                                      class="chip ${this._monthWeekday===e?"selected":""}"
                                      title=${J[e]??e}
                                      @click=${()=>{this._monthWeekday=e}}
                                    >
                                      ${t}
                                    </button>
                                  `)}
                              </div>
                            `}
                      </div>
                    `:h}
              </div>
            `:h}
      </div>
    `}_renderTimeAddRow(){let e=!!this._editingUid;return l`
      <div>
        <div class="add-row">
          <input
            class="message"
            type="text"
            placeholder="New reminder"
            .value=${this._message}
            @input=${t=>{this._message=t.target.value}}
            @keydown=${t=>{t.key==="Enter"&&this._add()}}
          />
          <input
            class="when"
            type="datetime-local"
            .value=${this._when}
            @input=${t=>{this._when=t.target.value}}
          />
          ${e?l`<button
                type="button"
                class="btn btn-secondary"
                ?disabled=${this._busy}
                @click=${()=>this._cancelEdit()}
              >
                Cancel
              </button>`:h}
          <button
            type="button"
            class="btn btn-primary"
            ?disabled=${this._busy}
            @click=${()=>this._add()}
          >
            ${e?"Save":"Add"}
          </button>
        </div>
        ${this._renderRepeatDisclosure()}
      </div>
    `}_renderLocationAddRow(){let e=!!this._editingUid;return l`
      <div>
        <div class="add-row">
          <input
            class="message"
            type="text"
            placeholder="New reminder"
            .value=${this._locMessage}
            @input=${t=>{this._locMessage=t.target.value}}
          />
          <ha-entity-picker
            class="picker"
            .hass=${this.hass}
            .value=${this._locPerson}
            .label=${"Person"}
            .includeDomains=${["person"]}
            @value-changed=${t=>{this._locPerson=t.detail.value}}
          ></ha-entity-picker>
          <ha-entity-picker
            class="picker"
            .hass=${this.hass}
            .value=${this._locZone}
            .label=${"Zone"}
            .includeDomains=${["zone"]}
            @value-changed=${t=>{this._locZone=t.detail.value}}
          ></ha-entity-picker>
          <select
            class="trigger"
            .value=${this._locTrigger}
            @change=${t=>{this._locTrigger=t.target.value}}
          >
            <option value="enter">Entering</option>
            <option value="leave">Leaving</option>
          </select>
          ${e?l`<button type="button" class="btn btn-secondary" ?disabled=${this._busy} @click=${()=>this._cancelEdit()}>Cancel</button>`:h}
          <button
            type="button"
            class="btn btn-primary"
            ?disabled=${this._busy}
            @click=${()=>this._addLocation()}
          >
            ${e?"Save":"Add"}
          </button>
        </div>
        <div class="repeat-row">
          ${this._renderSwitch(this._locPersistent,t=>{this._locPersistent=t})}
        </div>
      </div>
    `}_renderTimeRows(){let e=[],t="";for(let r of this._items){let s=this._dayKey(r.start),a=s!==t;a&&(e.push(this._renderDayHeader(r.start)),t=s),e.push(this._renderTimeItem(r,a))}return e}_renderTimeItem(e,t=!1){let r=!!e.rrule,s=r?this._formatRecurrence(e.rrule,e.start):this._formatTimeOnly(e.start);return l`
      <div class="item ${r?"recurring":""} ${t?"day-first":""}">
        <ha-icon
          class="leading"
          icon=${r?"mdi:repeat":"mdi:alarm"}
        ></ha-icon>
        <div class="text">
          <span class="summary">${e.summary}</span>
          <span class="time">${s}</span>
        </div>
        <ha-icon-button
          .label=${"Edit reminder"}
          @click=${()=>this._startEditTime(e)}
        >
          <ha-icon icon="mdi:pencil-outline"></ha-icon>
        </ha-icon-button>
        <ha-icon-button
          .label=${"Delete reminder"}
          @click=${()=>this._delete(e.uid)}
        >
          <ha-icon icon="mdi:delete-outline"></ha-icon>
        </ha-icon-button>
      </div>
    `}_renderSectionHeading(e,t,r,s,a,d){return l`
      <button
        class="section-heading"
        aria-expanded=${s?"false":"true"}
        aria-controls=${d}
        @click=${a}
      >
        <ha-icon icon=${t}></ha-icon>
        <span class="section-heading-label">${e}</span>
        <span class="section-heading-count">${r}</span>
        <ha-icon
          class="section-heading-chevron ${s?"collapsed":""}"
          icon="mdi:chevron-down"
        ></ha-icon>
      </button>
    `}_renderLocationItem(e,t=!1){let s=`${e.trigger==="enter"?"Entering":"Leaving"} ${this._entityName(e.zone)} \xB7 ${this._entityName(e.person)}`,a=e.deliveredAt?`Delivered ${this._formatTime(e.deliveredAt)} \xB7 ${s}`:e.persistent?`Repeating \xB7 ${s}`:s,d=e.persistent&&!e.deliveredAt;return l`
      <div class="item ${d?"persistent":""} ${e.deliveredAt?"delivered":""} ${t?"section-first":""}">
        <ha-icon class="leading" icon=${d?"mdi:map-marker-path":"mdi:map-marker"}></ha-icon>
        <div class="text">
          <span class="summary">${e.summary}</span>
          <span class="time">${a}</span>
        </div>
        ${e.deliveredAt?h:l`<ha-icon-button
              .label=${"Edit reminder"}
              @click=${()=>this._startEditLocation(e)}
            >
              <ha-icon icon="mdi:pencil-outline"></ha-icon>
            </ha-icon-button>`}
        <ha-icon-button
          .label=${"Delete reminder"}
          @click=${()=>this._deleteLocation(e.uid)}
        >
          <ha-icon icon="mdi:delete-outline"></ha-icon>
        </ha-icon-button>
      </div>
    `}render(){let e=this._config.title??"BToddB Reminders",t=this._locationItems(),r=t.filter(d=>!d.deliveredAt),s=t.filter(d=>d.deliveredAt).sort((d,o)=>o.deliveredAt.getTime()-d.deliveredAt.getTime()),a=this._items.length+t.length;return l`
      <ha-card .header=${e}>
        <div class="content">
          <div class="entry-panel">
            <div class="tabs">
              <button
                class="tab ${this._mode==="time"?"active":""}"
                @click=${()=>{this._mode!=="time"&&(this._cancelEdit(),this._mode="time")}}
              >
                Time
              </button>
              <button
                class="tab ${this._mode==="location"?"active":""}"
                @click=${()=>{this._mode!=="location"&&(this._cancelEdit(),this._mode="location")}}
              >
                Location
              </button>
            </div>

            ${this._mode==="time"?this._renderTimeAddRow():this._renderLocationAddRow()}
          </div>

          ${this._error?l`<div class="error">${this._error}</div>`:h}

          ${a===0?l`<div class="empty">No reminders.</div>`:l`
                <div class="list">
                  ${this._items.length?this._renderSectionHeading("Time","mdi:alarm",this._items.length,this._timeCollapsed,()=>{this._timeCollapsed=!this._timeCollapsed},"section-rows-time"):h}
                  <div id="section-rows-time">${this._timeCollapsed?h:this._renderTimeRows()}</div>
                  ${t.length?this._renderSectionHeading("Location","mdi:map-marker",t.length,this._locationCollapsed,()=>{this._locationCollapsed=!this._locationCollapsed},"section-rows-location"):h}
                  <div id="section-rows-location">${this._locationCollapsed?h:[...r,...s].map((d,o)=>this._renderLocationItem(d,this._items.length>0&&o===0))}</div>
                </div>
              `}
        </div>
      </ha-card>
    `}};W.properties={hass:{attribute:!1},_config:{state:!0},_items:{state:!0},_mode:{state:!0},_message:{state:!0},_when:{state:!0},_repeatOpen:{state:!0},_freq:{state:!0},_weekday:{state:!0},_interval:{state:!0},_monthMode:{state:!0},_monthDay:{state:!0},_monthOrdinal:{state:!0},_monthWeekday:{state:!0},_locMessage:{state:!0},_locPerson:{state:!0},_locZone:{state:!0},_locTrigger:{state:!0},_locPersistent:{state:!0},_busy:{state:!0},_error:{state:!0},_editingUid:{state:!0},_timeCollapsed:{state:!0},_locationCollapsed:{state:!0}},W.styles=v`
    .content {
      padding: 0 16px 12px;
    }
    .entry-panel {
      margin-top: 12px;
      padding: 12px;
      border: 1px solid var(--divider-color, #e0e0e0);
      border-radius: 10px;
      background: color-mix(
        in srgb,
        var(--primary-text-color, #212121) 4%,
        transparent
      );
    }
    .tabs {
      display: flex;
      gap: 8px;
    }
    .entry-panel .add-row {
      padding-top: 12px;
    }
    .tab {
      flex: 0 0 auto;
      height: 32px;
      padding: 0 14px;
      border: 1px solid var(--divider-color, #e0e0e0);
      border-radius: 16px;
      background: var(--card-background-color, #fff);
      color: var(--secondary-text-color, #727272);
      font-family: inherit;
      font-size: 13px;
      cursor: pointer;
    }
    .tab.active {
      border-color: var(--primary-color, #03a9f4);
      color: var(--primary-color, #03a9f4);
    }
    .add-row {
      display: flex;
      align-items: center;
      gap: 8px;
      padding-top: 8px;
      flex-wrap: wrap;
    }
    .message,
    .when,
    .trigger {
      height: 40px;
      padding: 0 8px;
      border: 1px solid var(--divider-color, #e0e0e0);
      border-radius: 4px;
      background: var(--card-background-color, #fff);
      color: var(--primary-text-color, #212121);
      color-scheme: light dark;
      font-family: inherit;
      font-size: 14px;
      box-sizing: border-box;
    }
    .message {
      flex: 1 1 160px;
      min-width: 140px;
    }
    .when,
    .trigger {
      flex: 0 0 auto;
    }
    .picker {
      flex: 1 1 140px;
      min-width: 130px;
    }
    .btn {
      flex: 0 0 auto;
      height: 36px;
      padding: 0 16px;
      border-radius: 4px;
      font-family: inherit;
      font-size: 14px;
      font-weight: 500;
      letter-spacing: 0.025em;
      cursor: pointer;
      transition: box-shadow 0.15s, background 0.15s;
    }
    .btn:disabled {
      opacity: 0.38;
      cursor: not-allowed;
    }
    .btn-primary {
      background: var(--primary-color, #03a9f4);
      color: var(--text-primary-color, #fff);
      border: none;
      box-shadow: 0 1px 3px rgba(0, 0, 0, 0.3);
    }
    .btn-primary:hover:not(:disabled) {
      box-shadow: 0 3px 6px rgba(0, 0, 0, 0.35);
    }
    .btn-secondary {
      background: transparent;
      color: var(--primary-color, #03a9f4);
      border: 1px solid var(--primary-color, #03a9f4);
    }
    .btn-secondary:hover:not(:disabled) {
      background: color-mix(
        in srgb,
        var(--primary-color, #03a9f4) 10%,
        transparent
      );
    }
    .error {
      color: var(--error-color, #db4437);
      padding: 8px 0;
      font-size: 14px;
    }
    .empty {
      color: var(--secondary-text-color, #727272);
      padding: 16px 0 4px;
      text-align: center;
    }
    .list {
      display: flex;
      flex-direction: column;
      margin-top: 8px;
    }
    .item {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 6px 0;
      border-top: 1px solid var(--divider-color, #e0e0e0);
    }
    .item:first-child {
      border-top: none;
    }
    .day-header {
      color: var(--secondary-text-color, #727272);
      font-size: 11px;
      font-weight: 600;
      letter-spacing: 0.05em;
      text-transform: uppercase;
      padding: 8px 0 2px;
      margin-top: 4px;
      border-top: 1px solid var(--divider-color, #e0e0e0);
    }
    .section-heading + .day-header {
      border-top: none;
    }
    .item.day-first {
      border-top: none;
    }
    .item.section-first {
      border-top: none;
    }
    /* Filled, tinted banner for reminder groups; acts as a collapse toggle. */
    .section-heading {
      display: flex;
      align-items: center;
      gap: 8px;
      width: 100%;
      margin: 14px 0 2px;
      padding: 9px 12px;
      border-top: none;
      border-right: none;
      border-bottom: none;
      border-left: 4px solid var(--primary-color, #03a9f4);
      border-radius: 8px;
      background: color-mix(in srgb, var(--primary-color, #03a9f4) 14%, transparent);
      color: var(--primary-color, #03a9f4);
      font-size: 12px;
      font-family: inherit;
      font-weight: 700;
      letter-spacing: 0.07em;
      text-transform: uppercase;
      cursor: pointer;
      box-sizing: border-box;
    }
    .section-heading:hover {
      background: color-mix(in srgb, var(--primary-color, #03a9f4) 20%, transparent);
    }
    .section-heading:focus-visible {
      outline: 2px solid var(--primary-color, #03a9f4);
      outline-offset: 2px;
    }
    .list > .section-heading:first-child {
      margin-top: 0;
    }
    .section-heading ha-icon {
      --mdc-icon-size: 18px;
      width: 18px;
      height: 18px;
      color: var(--primary-color, #03a9f4);
    }
    .section-heading-label {
      flex: 1 1 auto;
    }
    .section-heading-count {
      font-weight: 400;
      font-size: 11px;
      opacity: 0.7;
      text-transform: none;
      letter-spacing: normal;
    }
    .section-heading-chevron {
      transition: transform 0.2s;
      flex-shrink: 0;
    }
    .section-heading-chevron.collapsed {
      transform: rotate(-90deg);
    }
    .leading {
      color: var(--state-icon-color, var(--primary-color, #03a9f4));
      flex: 0 0 auto;
    }
    .text {
      display: flex;
      flex-direction: column;
      flex: 1 1 auto;
      min-width: 0;
    }
    .summary {
      color: var(--primary-text-color, #212121);
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }
    .item.delivered .summary {
      text-decoration: line-through;
      color: var(--secondary-text-color, #727272);
    }
    .item.delivered .leading {
      color: var(--secondary-text-color, #727272);
    }
    .item.recurring .leading {
      color: var(--accent-color, var(--primary-color, #03a9f4));
    }
    .item.persistent .leading {
      color: var(--accent-color, var(--primary-color, #03a9f4));
    }
    .time {
      color: var(--secondary-text-color, #727272);
      font-size: 12px;
    }
    ha-icon-button {
      color: var(--secondary-text-color, #727272);
      flex: 0 0 auto;
    }
    /* Repeat toggle switch */
    .repeat-row {
      padding-top: 6px;
    }
    .repeat-switch {
      display: flex;
      align-items: center;
      gap: 8px;
      cursor: pointer;
      font-size: 13px;
      user-select: none;
    }
    .repeat-switch input[type="checkbox"] {
      position: absolute;
      width: 1px;
      height: 1px;
      padding: 0;
      margin: -1px;
      overflow: hidden;
      clip: rect(0, 0, 0, 0);
      white-space: nowrap;
      border: 0;
    }
    .repeat-switch-track {
      position: relative;
      width: 36px;
      height: 20px;
      background: var(--divider-color, #e0e0e0);
      border-radius: 10px;
      transition: background 0.2s;
      flex-shrink: 0;
    }
    .repeat-switch input:checked ~ .repeat-switch-track {
      background: var(--primary-color, #03a9f4);
    }
    .repeat-switch-thumb {
      position: absolute;
      top: 2px;
      left: 2px;
      width: 16px;
      height: 16px;
      background: #fff;
      border-radius: 50%;
      transition: transform 0.2s;
    }
    .repeat-switch input:checked ~ .repeat-switch-track .repeat-switch-thumb {
      transform: translateX(16px);
    }
    .repeat-switch input:focus-visible ~ .repeat-switch-track {
      outline: 2px solid var(--primary-color, #03a9f4);
      outline-offset: 2px;
    }
    .repeat-switch-label {
      color: var(--secondary-text-color, #727272);
    }
    .repeat-switch:has(input:checked) .repeat-switch-label {
      color: var(--primary-color, #03a9f4);
    }
    .repeat-body {
      display: flex;
      flex-wrap: wrap;
      align-items: center;
      gap: 8px;
      margin-top: 6px;
      padding: 8px 10px;
      border: 1px solid var(--divider-color, #e0e0e0);
      border-radius: 4px;
    }
    .freq-select {
      height: 36px;
      padding: 0 8px;
      border: 1px solid var(--divider-color, #e0e0e0);
      border-radius: 4px;
      background: var(--card-background-color, #fff);
      color: var(--primary-text-color, #212121);
      color-scheme: light dark;
      font-family: inherit;
      font-size: 14px;
    }
    .interval-input {
      width: 48px;
      height: 36px;
      padding: 0 6px;
      border: 1px solid var(--divider-color, #e0e0e0);
      border-radius: 4px;
      background: var(--card-background-color, #fff);
      color: var(--primary-text-color, #212121);
      color-scheme: light dark;
      font-family: inherit;
      font-size: 14px;
      box-sizing: border-box;
    }
    .interval-label {
      color: var(--secondary-text-color, #727272);
      font-size: 13px;
    }
    .weekday-chips {
      display: flex;
      gap: 4px;
    }
    .chip {
      width: 28px;
      height: 28px;
      border-radius: 50%;
      border: 1px solid var(--divider-color, #e0e0e0);
      background: var(--card-background-color, #fff);
      color: var(--secondary-text-color, #727272);
      font-size: 11px;
      font-family: inherit;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 0;
      box-sizing: border-box;
    }
    .chip.selected {
      background: var(--primary-color, #03a9f4);
      color: var(--text-primary-color, #fff);
      border-color: var(--primary-color, #03a9f4);
    }
    .chip:hover:not(.selected) {
      border-color: var(--primary-color, #03a9f4);
      color: var(--primary-color, #03a9f4);
    }
    .month-opts {
      display: flex;
      flex-wrap: wrap;
      align-items: center;
      gap: 8px;
      margin-top: 6px;
    }
    .month-mode-select,
    .month-day-select,
    .month-ordinal-select {
      height: 36px;
      padding: 0 8px;
      border: 1px solid var(--divider-color, #e0e0e0);
      border-radius: 4px;
      background: var(--card-background-color, #fff);
      color: var(--primary-text-color, #212121);
      color-scheme: light dark;
      font-family: inherit;
      font-size: 14px;
    }
  `;customElements.get("btoddb-reminders-card")||customElements.define("btoddb-reminders-card",W);function $e(n){if(typeof n=="number"&&Number.isFinite(n))return Math.max(0,Math.floor(n));if(typeof n!="string")return 0;let i=n.trim().match(/^(?:(\d+)\s+days?,\s*)?(\d+):([0-5]?\d):([0-5]?\d)$/);if(!i)return 0;let[,e,t,r,s]=i;return(e?parseInt(e,10)*86400:0)+parseInt(t,10)*3600+parseInt(r,10)*60+parseInt(s,10)}var be=n=>String(n).padStart(2,"0");function ee(n){let i=Math.max(0,Math.floor(n)),e=Math.floor(i/3600),t=Math.floor(i%3600/60),r=i%60;return`${e}:${be(t)}:${be(r)}`}function xe(n){let i=Math.max(0,Math.floor(n));return i<3600?`${Math.floor(i/60)}:${be(i%60)}`:ee(i)}function Ge(n,i){return Math.max(0,Math.ceil((n-i)/1e3))}function Je(n,i){return n<=0?0:Math.min(1,Math.max(0,(n-i)/n))}function Xe(n){let i=e=>e.state==="active"?0:e.state==="paused"?1:e.state==="idle"?2:3;return[...n].sort((e,t)=>{let r=i(e)-i(t);return r!==0?r:e.state==="active"?(e.finishesAtMs??1/0)-(t.finishesAtMs??1/0):e.state==="paused"?e.remainingSec-t.remainingSec:e.name.localeCompare(t.name)})}function et(n){let i=[],e=[];if(!Array.isArray(n))return{valid:i,rejected:e};for(let t of n)typeof t=="string"&&t.startsWith("timer.")?i.push(t):e.push(String(t));return{valid:i,rejected:e}}var tt=1e4,Y=class extends f{constructor(){super(...arguments);this._config={type:""}}setConfig(e){this._config=e}_titleChanged(e){let t=e.target.value,r={...this._config};t?r.title=t:delete r.title,this._fireConfigChanged(r)}_entityChanged(e,t){let r=t.detail.value??"",s=[...this._config.entities??[]];e===s.length?r&&s.push(r):r?s[e]=r:s.splice(e,1);let a={...this._config};s.length?a.entities=s:delete a.entities,this._fireConfigChanged(a)}_fireConfigChanged(e){this._config=e,this.dispatchEvent(new CustomEvent("config-changed",{detail:{config:e},bubbles:!0,composed:!0}))}render(){if(!this.hass||!this._config)return l``;let e=this._config.entities??[];return l`
      <div class="card-config">
        <input
          class="title-field"
          type="text"
          placeholder="Title (optional)"
          .value=${this._config.title??""}
          @change=${this._titleChanged}
        />
        <div class="hint">
          Leave the list empty to show every timer automatically.
        </div>
        ${[...e,""].map((t,r)=>l`
            <ha-entity-picker
              .hass=${this.hass}
              .value=${t}
              .label=${t?"Timer":"Add timer"}
              .includeDomains=${["timer"]}
              @value-changed=${s=>this._entityChanged(r,s)}
            ></ha-entity-picker>
          `)}
      </div>
    `}};Y.properties={hass:{attribute:!1},_config:{state:!0}},Y.styles=v`
    .card-config {
      display: flex;
      flex-direction: column;
      gap: 16px;
      padding: 16px;
    }
    .title-field,
    ha-entity-picker {
      width: 100%;
    }
    .title-field {
      height: 40px;
      padding: 0 8px;
      border: 1px solid var(--divider-color, #e0e0e0);
      border-radius: 4px;
      background: var(--card-background-color, #fff);
      color: var(--primary-text-color, #212121);
      color-scheme: light dark;
      font-family: inherit;
      font-size: 14px;
      box-sizing: border-box;
    }
    .hint {
      color: var(--secondary-text-color, #727272);
      font-size: 12px;
      margin-bottom: -8px;
    }
  `;customElements.define("btoddb-timer-card-editor",Y);var j=class extends f{constructor(){super(...arguments);this._config={type:""};this._now=Date.now();this._error="";this._flashes={};this._durEditId="";this._durMin=0;this._durSec=0;this._menuOpenId="";this._createOpen=!1;this._createName="";this._createMin=5;this._createSec=0;this._busy=!1;this._configEntities=[]}static getConfigElement(){return document.createElement("btoddb-timer-card-editor")}static getStubConfig(){return{}}setConfig(e){this._config=e??{type:""};let{valid:t,rejected:r}=et(e?.entities);r.length&&console.warn(`btoddb-timer-card: ignoring non-timer entities: ${r.join(", ")}`),this._configEntities=t}getCardSize(){return 1+Math.min(this._rows().length,8)}disconnectedCallback(){super.disconnectedCallback(),this._stopTick(),this._unsubFinished?.then(e=>e()).catch(()=>{}),this._unsubFinished=void 0}updated(){this.hass&&(!this._unsubFinished&&this.hass.connection&&(this._unsubFinished=this.hass.connection.subscribeEvents(e=>this._onTimerFinished(e),"timer.finished"),this._unsubFinished.catch(()=>{this._unsubFinished=void 0})),this._syncTick())}_syncTick(){let e=this._rows().some(t=>t.state==="active");e&&this._tick===void 0?this._tick=window.setInterval(()=>{this._now=Date.now()},1e3):e||this._stopTick()}_stopTick(){this._tick!==void 0&&(window.clearInterval(this._tick),this._tick=void 0)}_onTimerFinished(e){let t=e.data?.entity_id??"";this._entityIds().includes(t)&&(this._flashes={...this._flashes,[t]:Date.now()+tt},window.setTimeout(()=>this._expireFlashes(),tt+100))}_expireFlashes(){let e=Date.now(),t=Object.entries(this._flashes).filter(([,r])=>r>e);t.length!==Object.keys(this._flashes).length&&(this._flashes=Object.fromEntries(t))}_dismissFlash(e){if(!(e in this._flashes))return;let{[e]:t,...r}=this._flashes;this._flashes=r}_entityIds(){return this._configEntities.length?this._configEntities:Object.keys(this.hass?.states??{}).filter(e=>e.startsWith("timer."))}_rows(){let e=[];for(let t of this._entityIds()){let r=this.hass?.states[t];if(!r)continue;let s=r.attributes.finishes_at,a=s?Date.parse(s):NaN;e.push({entityId:t,name:r.attributes.friendly_name??t,state:r.state,durationSec:$e(r.attributes.duration),remainingSec:$e(r.attributes.remaining),finishesAtMs:Number.isFinite(a)?a:null})}return this._configEntities.length?e:Xe(e)}_isAdmin(){return this.hass?.user?.is_admin===!0}_msg(e){return e&&typeof e=="object"&&"message"in e?String(e.message):String(e)}async _service(e,t,r){let s={entity_id:t};r&&(s.duration=r),this._error="";try{await this.hass.callService("timer",e,s)}catch(a){this._error=`Could not ${e} timer: ${this._msg(a)}`}}_openDurEdit(e){this._durEditId=e.entityId,this._durMin=Math.floor(e.durationSec/60),this._durSec=e.durationSec%60,this._menuOpenId=""}_closeDurEdit(){this._durEditId=""}_durEditSeconds(){return this._durMin*60+this._durSec}async _startEdited(e){let t=this._durEditSeconds();if(t<=0){this._error="Duration must be more than zero.";return}this._closeDurEdit(),await this._service("start",e,ee(t))}async _create(){let e=this._createName.trim();if(!e){this._error="Enter a timer name.";return}let t=this._createMin*60+this._createSec;if(t<=0){this._error="Duration must be more than zero.";return}this._busy=!0,this._error="";try{await this.hass.callWS({type:"timer/create",name:e,duration:ee(t),restore:!0}),this._createOpen=!1,this._createName="",this._createMin=5,this._createSec=0}catch(r){this._error=`Could not create timer: ${this._msg(r)}`}finally{this._busy=!1}}async _delete(e){if(this._menuOpenId="",!!window.confirm(`Delete timer "${e.name}"?`)){this._error="";try{let t=await this.hass.callWS({type:"config/entity_registry/get",entity_id:e.entityId});await this.hass.callWS({type:"timer/delete",timer_id:t.unique_id})}catch(t){this._error=`Could not delete timer (YAML-defined timers can only be removed in YAML): ${this._msg(t)}`}}}_renderDurEdit(e){let t=(r,s,a)=>l`
      <input
        class="dur-input"
        type="number"
        min="0"
        max=${s}
        .value=${String(r)}
        @input=${d=>{let o=parseInt(d.target.value,10);a(Number.isFinite(o)&&o>=0?o:0)}}
      />
    `;return l`
      <div class="dur-edit">
        ${t(this._durMin,999,r=>this._durMin=r)}
        <span class="dur-label">min</span>
        ${t(this._durSec,59,r=>this._durSec=Math.min(r,59))}
        <span class="dur-label">sec</span>
        ${[1,5,10].map(r=>l`
            <button
              type="button"
              class="chip"
              @click=${()=>this._durMin=this._durMin+r}
            >
              +${r}m
            </button>
          `)}
        <button
          type="button"
          class="btn btn-primary"
          @click=${()=>this._startEdited(e.entityId)}
        >
          Start
        </button>
        <button
          type="button"
          class="btn btn-secondary"
          @click=${()=>this._closeDurEdit()}
        >
          Cancel
        </button>
      </div>
    `}_renderRow(e){if(e.entityId in this._flashes)return l`
        <div
          class="item finished"
          role="button"
          tabindex="0"
          title="Tap to dismiss"
          @click=${()=>this._dismissFlash(e.entityId)}
          @keydown=${o=>{(o.key==="Enter"||o.key===" ")&&this._dismissFlash(e.entityId)}}
        >
          <ha-icon class="leading" icon="mdi:check-circle"></ha-icon>
          <div class="text">
            <span class="summary">${e.name} — Done!</span>
          </div>
        </div>
      `;let t=e.state==="active",r=e.state==="paused",s=t&&e.finishesAtMs!==null?Ge(e.finishesAtMs,this._now):e.remainingSec,a=t?"mdi:timer-outline":r?"mdi:timer-pause-outline":"mdi:timer-off-outline",d=this._durEditId===e.entityId;return l`
      <div class="item ${e.state}">
        <ha-icon class="leading" icon=${a}></ha-icon>
        <div class="text">
          <span class="summary">${e.name}</span>
          ${t?l`<div class="progress">
                <div
                  class="progress-fill"
                  style="width:${(Je(e.durationSec,s)*100).toFixed(1)}%"
                ></div>
              </div>`:h}
        </div>
        ${t||r?l`<span class="countdown ${r?"paused":""}"
              >${xe(s)}</span
            >`:l`<button
              type="button"
              class="duration-btn"
              title="Set a different duration"
              @click=${()=>this._openDurEdit(e)}
            >
              ${xe(e.durationSec)}
            </button>`}
        ${t?l`
              <ha-icon-button
                .label=${"Pause timer"}
                @click=${()=>this._service("pause",e.entityId)}
              >
                <ha-icon icon="mdi:pause"></ha-icon>
              </ha-icon-button>
            `:l`
              <ha-icon-button
                .label=${r?"Resume timer":"Start timer"}
                @click=${()=>this._service("start",e.entityId)}
              >
                <ha-icon icon="mdi:play"></ha-icon>
              </ha-icon-button>
            `}
        ${t||r?l`
              <ha-icon-button
                .label=${"Cancel timer"}
                @click=${()=>this._service("cancel",e.entityId)}
              >
                <ha-icon icon="mdi:close"></ha-icon>
              </ha-icon-button>
            `:this._isAdmin()?l`
                <div class="menu-wrap">
                  <ha-icon-button
                    .label=${"More options"}
                    @click=${()=>{this._menuOpenId=this._menuOpenId===e.entityId?"":e.entityId}}
                  >
                    <ha-icon icon="mdi:dots-vertical"></ha-icon>
                  </ha-icon-button>
                  ${this._menuOpenId===e.entityId?l`
                        <div class="menu">
                          <button
                            type="button"
                            class="menu-item"
                            @click=${()=>this._delete(e)}
                          >
                            <ha-icon icon="mdi:delete-outline"></ha-icon>
                            Delete
                          </button>
                        </div>
                      `:h}
                </div>
              `:h}
      </div>
      ${d?this._renderDurEdit(e):h}
    `}_renderCreatePanel(){return l`
      <div class="create-panel">
        <input
          class="create-name"
          type="text"
          placeholder="Timer name"
          .value=${this._createName}
          @input=${e=>{this._createName=e.target.value}}
          @keydown=${e=>{e.key==="Enter"&&this._create()}}
        />
        <input
          class="dur-input"
          type="number"
          min="0"
          max="999"
          .value=${String(this._createMin)}
          @input=${e=>{let t=parseInt(e.target.value,10);this._createMin=Number.isFinite(t)&&t>=0?t:0}}
        />
        <span class="dur-label">min</span>
        <input
          class="dur-input"
          type="number"
          min="0"
          max="59"
          .value=${String(this._createSec)}
          @input=${e=>{let t=parseInt(e.target.value,10);this._createSec=Number.isFinite(t)&&t>=0?Math.min(t,59):0}}
        />
        <span class="dur-label">sec</span>
        <button
          type="button"
          class="btn btn-primary"
          ?disabled=${this._busy}
          @click=${()=>this._create()}
        >
          Create
        </button>
        <button
          type="button"
          class="btn btn-secondary"
          ?disabled=${this._busy}
          @click=${()=>{this._createOpen=!1}}
        >
          Cancel
        </button>
      </div>
    `}render(){if(!this.hass)return h;this._expireFlashes();let e=this._config.title??"Timers",t=this._rows();return l`
      <ha-card>
        <div class="header">
          <span class="header-title">${e}</span>
          ${this._isAdmin()?l`
                <ha-icon-button
                  .label=${"New timer"}
                  @click=${()=>{this._createOpen=!this._createOpen}}
                >
                  <ha-icon icon="mdi:plus"></ha-icon>
                </ha-icon-button>
              `:h}
        </div>
        <div class="content">
          ${this._createOpen?this._renderCreatePanel():h}
          ${this._error?l`<div class="error">${this._error}</div>`:h}
          ${t.length?l`<div class="list">${t.map(r=>this._renderRow(r))}</div>`:l`<div class="empty">
                No timers.${this._isAdmin()?" Use \uFF0B to create one.":""}
              </div>`}
        </div>
      </ha-card>
    `}};j.properties={hass:{attribute:!1},_config:{state:!0},_now:{state:!0},_error:{state:!0},_flashes:{state:!0},_durEditId:{state:!0},_durMin:{state:!0},_durSec:{state:!0},_menuOpenId:{state:!0},_createOpen:{state:!0},_createName:{state:!0},_createMin:{state:!0},_createSec:{state:!0},_busy:{state:!0}},j.styles=v`
    .header {
      display: flex;
      align-items: center;
      padding: 12px 8px 0 16px;
    }
    .header-title {
      flex: 1 1 auto;
      font-size: var(--ha-card-header-font-size, 24px);
      color: var(--ha-card-header-color, var(--primary-text-color, #212121));
      line-height: 1.2;
    }
    .content {
      padding: 0 16px 12px;
    }
    .create-panel {
      display: flex;
      align-items: center;
      flex-wrap: wrap;
      gap: 8px;
      margin-top: 12px;
      padding: 12px;
      border: 1px solid var(--divider-color, #e0e0e0);
      border-radius: 10px;
      background: color-mix(
        in srgb,
        var(--primary-text-color, #212121) 4%,
        transparent
      );
    }
    .create-name {
      flex: 1 1 140px;
      min-width: 120px;
      height: 40px;
      padding: 0 8px;
      border: 1px solid var(--divider-color, #e0e0e0);
      border-radius: 4px;
      background: var(--card-background-color, #fff);
      color: var(--primary-text-color, #212121);
      color-scheme: light dark;
      font-family: inherit;
      font-size: 14px;
      box-sizing: border-box;
    }
    .error {
      color: var(--error-color, #db4437);
      padding: 8px 0;
      font-size: 14px;
    }
    .empty {
      color: var(--secondary-text-color, #727272);
      padding: 16px 0 4px;
      text-align: center;
    }
    .list {
      display: flex;
      flex-direction: column;
      margin-top: 8px;
    }
    .item {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 8px 0;
      border-top: 1px solid var(--divider-color, #e0e0e0);
    }
    .item:first-child {
      border-top: none;
    }
    .leading {
      color: var(--state-icon-color, var(--primary-color, #03a9f4));
      flex: 0 0 auto;
    }
    .item.idle .leading {
      color: var(--secondary-text-color, #727272);
    }
    .item.paused .leading {
      color: var(--warning-color, #ffa600);
    }
    .item.finished {
      cursor: pointer;
    }
    .item.finished .leading {
      color: var(--success-color, #43a047);
      animation: flash-pulse 1s ease-in-out infinite;
    }
    .item.finished .summary {
      color: var(--success-color, #43a047);
      font-weight: 600;
    }
    @keyframes flash-pulse {
      50% {
        opacity: 0.4;
      }
    }
    .text {
      display: flex;
      flex-direction: column;
      flex: 1 1 auto;
      min-width: 0;
      gap: 4px;
    }
    .summary {
      color: var(--primary-text-color, #212121);
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }
    .progress {
      height: 4px;
      border-radius: 2px;
      background: color-mix(
        in srgb,
        var(--primary-color, #03a9f4) 20%,
        transparent
      );
      overflow: hidden;
    }
    .progress-fill {
      height: 100%;
      border-radius: 2px;
      background: var(--primary-color, #03a9f4);
      transition: width 1s linear;
    }
    .countdown {
      font-variant-numeric: tabular-nums;
      font-size: 18px;
      font-weight: 500;
      color: var(--primary-text-color, #212121);
    }
    .countdown.paused {
      color: var(--secondary-text-color, #727272);
    }
    .duration-btn {
      border: none;
      background: none;
      padding: 2px 6px;
      border-radius: 4px;
      font-family: inherit;
      font-variant-numeric: tabular-nums;
      font-size: 18px;
      font-weight: 500;
      color: var(--secondary-text-color, #727272);
      cursor: pointer;
    }
    .duration-btn:hover {
      background: color-mix(
        in srgb,
        var(--primary-color, #03a9f4) 10%,
        transparent
      );
      color: var(--primary-color, #03a9f4);
    }
    ha-icon-button {
      color: var(--secondary-text-color, #727272);
      flex: 0 0 auto;
    }
    .menu-wrap {
      position: relative;
    }
    .menu {
      position: absolute;
      right: 0;
      top: 40px;
      z-index: 3;
      background: var(--card-background-color, #fff);
      border: 1px solid var(--divider-color, #e0e0e0);
      border-radius: 8px;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.25);
      overflow: hidden;
    }
    .menu-item {
      display: flex;
      align-items: center;
      gap: 8px;
      width: 100%;
      padding: 10px 16px;
      border: none;
      background: none;
      color: var(--primary-text-color, #212121);
      font-family: inherit;
      font-size: 14px;
      cursor: pointer;
      white-space: nowrap;
    }
    .menu-item:hover {
      background: color-mix(
        in srgb,
        var(--primary-text-color, #212121) 8%,
        transparent
      );
    }
    .menu-item ha-icon {
      --mdc-icon-size: 18px;
      color: var(--secondary-text-color, #727272);
    }
    .dur-edit {
      display: flex;
      align-items: center;
      flex-wrap: wrap;
      gap: 8px;
      padding: 8px 10px;
      margin: 0 0 8px 36px;
      border: 1px solid var(--divider-color, #e0e0e0);
      border-radius: 8px;
    }
    .dur-input {
      width: 56px;
      height: 36px;
      padding: 0 6px;
      border: 1px solid var(--divider-color, #e0e0e0);
      border-radius: 4px;
      background: var(--card-background-color, #fff);
      color: var(--primary-text-color, #212121);
      color-scheme: light dark;
      font-family: inherit;
      font-size: 14px;
      box-sizing: border-box;
    }
    .dur-label {
      color: var(--secondary-text-color, #727272);
      font-size: 13px;
    }
    .chip {
      height: 28px;
      padding: 0 10px;
      border-radius: 14px;
      border: 1px solid var(--divider-color, #e0e0e0);
      background: var(--card-background-color, #fff);
      color: var(--secondary-text-color, #727272);
      font-size: 12px;
      font-family: inherit;
      cursor: pointer;
    }
    .chip:hover {
      border-color: var(--primary-color, #03a9f4);
      color: var(--primary-color, #03a9f4);
    }
    .btn {
      flex: 0 0 auto;
      height: 36px;
      padding: 0 16px;
      border-radius: 4px;
      font-family: inherit;
      font-size: 14px;
      font-weight: 500;
      letter-spacing: 0.025em;
      cursor: pointer;
      transition: box-shadow 0.15s, background 0.15s;
    }
    .btn:disabled {
      opacity: 0.38;
      cursor: not-allowed;
    }
    .btn-primary {
      background: var(--primary-color, #03a9f4);
      color: var(--text-primary-color, #fff);
      border: none;
      box-shadow: 0 1px 3px rgba(0, 0, 0, 0.3);
    }
    .btn-primary:hover:not(:disabled) {
      box-shadow: 0 3px 6px rgba(0, 0, 0, 0.35);
    }
    .btn-secondary {
      background: transparent;
      color: var(--primary-color, #03a9f4);
      border: 1px solid var(--primary-color, #03a9f4);
    }
    .btn-secondary:hover:not(:disabled) {
      background: color-mix(
        in srgb,
        var(--primary-color, #03a9f4) 10%,
        transparent
      );
    }
  `;customElements.get("btoddb-timer-card")||customElements.define("btoddb-timer-card",j);var wt="v0.0.84";console.info(`%c BTODDB-HA-REMINDERS %c ${wt} `,"color: white; background: #03a9f4; font-weight: 700;","color: #03a9f4; background: white; font-weight: 700;");window.customCards=window.customCards||[];window.customCards.push({type:"btoddb-reminders-card",name:"BToddB Reminders",description:"Create reminders and see the upcoming ones.",preview:!1,documentationURL:"https://github.com/btoddb/ha-reminders"});window.customCards.push({type:"btoddb-calendar-list-card",name:"BToddB Calendar List",description:"Show calendars and reminders as a compact agenda.",preview:!1,documentationURL:"https://github.com/btoddb/ha-reminders"});window.customCards.push({type:"btoddb-timer-card",name:"BToddB Timers",description:"Manage Home Assistant's built-in countdown timers.",preview:!1,documentationURL:"https://github.com/btoddb/ha-reminders"});
/*! Bundled license information:

@lit/reactive-element/css-tag.js:
  (**
   * @license
   * Copyright 2019 Google LLC
   * SPDX-License-Identifier: BSD-3-Clause
   *)

@lit/reactive-element/reactive-element.js:
lit-html/lit-html.js:
lit-element/lit-element.js:
  (**
   * @license
   * Copyright 2017 Google LLC
   * SPDX-License-Identifier: BSD-3-Clause
   *)

lit-html/is-server.js:
  (**
   * @license
   * Copyright 2022 Google LLC
   * SPDX-License-Identifier: BSD-3-Clause
   *)
*/
//# sourceMappingURL=btoddb-ha-reminders.js.map
