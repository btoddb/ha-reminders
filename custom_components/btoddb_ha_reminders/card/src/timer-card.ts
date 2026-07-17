// The `btoddb-timer-card` Lovelace card (TC-1..TC-10): manage Home Assistant's
// built-in `timer` helpers — start / pause / resume / cancel, ad-hoc durations,
// live countdowns, and (for admins) create / delete of timer helpers.
//
// Built like the sibling cards: stock HA web components (ha-card, ha-icon,
// ha-icon-button) plus native inputs and Lit — no custom-card-helpers. All
// countdown math and ordering lives in timer-logic.ts so it stays unit-testable.

import { LitElement, css, html, nothing } from "lit";
import {
  formatCountdown,
  parseDuration,
  partitionTimerEntities,
  progressFraction,
  secondsRemaining,
  sortTimerRows,
  toServiceDuration,
  type TimerRowData,
} from "./timer-logic";

interface HassEntity {
  state: string;
  attributes: Record<string, unknown>;
}

interface HassConnection {
  subscribeEvents: <T>(
    callback: (event: T) => void,
    eventType: string,
  ) => Promise<() => Promise<void>>;
}

interface Hass {
  states: Record<string, HassEntity>;
  user?: { is_admin?: boolean };
  connection: HassConnection;
  callService: (
    domain: string,
    service: string,
    serviceData?: Record<string, unknown>,
  ) => Promise<unknown>;
  callWS: <T>(msg: Record<string, unknown>) => Promise<T>;
}

interface CardConfig {
  type: string;
  title?: string;
  entities?: string[];
}

interface TimerFinishedEvent {
  data: { entity_id?: string };
}

interface EntityRegistryEntry {
  unique_id: string;
}

/** How long a finished row keeps its "Done" treatment (TC-7). */
const FLASH_MS = 10_000;

export class BtoddbTimerCardEditor extends LitElement {
  static properties = {
    hass: { attribute: false },
    _config: { state: true },
  };

  hass!: Hass;
  private _config: CardConfig = { type: "" };

  setConfig(config: CardConfig): void {
    this._config = config;
  }

  private _titleChanged(ev: Event): void {
    const value = (ev.target as HTMLInputElement).value;
    const config: CardConfig = { ...this._config };
    if (value) {
      config.title = value;
    } else {
      delete config.title;
    }
    this._fireConfigChanged(config);
  }

  private _entityChanged(index: number, ev: CustomEvent): void {
    const value = (ev.detail.value as string) ?? "";
    const entities = [...(this._config.entities ?? [])];
    if (index === entities.length) {
      if (value) entities.push(value);
    } else if (value) {
      entities[index] = value;
    } else {
      entities.splice(index, 1);
    }
    const config: CardConfig = { ...this._config };
    // An empty list means "auto-discover"; store that as no key at all.
    if (entities.length) {
      config.entities = entities;
    } else {
      delete config.entities;
    }
    this._fireConfigChanged(config);
  }

  private _fireConfigChanged(config: CardConfig): void {
    this._config = config;
    this.dispatchEvent(
      new CustomEvent("config-changed", {
        detail: { config },
        bubbles: true,
        composed: true,
      }),
    );
  }

  render() {
    if (!this.hass || !this._config) return html``;
    const entities = this._config.entities ?? [];
    return html`
      <div class="card-config">
        <input
          class="title-field"
          type="text"
          placeholder="Title (optional)"
          .value=${this._config.title ?? ""}
          @change=${this._titleChanged}
        />
        <div class="hint">
          Leave the list empty to show every timer automatically.
        </div>
        ${[...entities, ""].map(
          (entity, i) => html`
            <ha-entity-picker
              .hass=${this.hass}
              .value=${entity}
              .label=${entity ? "Timer" : "Add timer"}
              .includeDomains=${["timer"]}
              @value-changed=${(ev: CustomEvent) => this._entityChanged(i, ev)}
            ></ha-entity-picker>
          `,
        )}
      </div>
    `;
  }

  static styles = css`
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
  `;
}

customElements.define("btoddb-timer-card-editor", BtoddbTimerCardEditor);

export class BtoddbTimerCard extends LitElement {
  static properties = {
    hass: { attribute: false },
    _config: { state: true },
    _now: { state: true },
    _error: { state: true },
    _flashes: { state: true },
    _durEditId: { state: true },
    _durMin: { state: true },
    _durSec: { state: true },
    _menuOpenId: { state: true },
    _createOpen: { state: true },
    _createName: { state: true },
    _createMin: { state: true },
    _createSec: { state: true },
    _busy: { state: true },
  };

  hass!: Hass;
  private _config: CardConfig = { type: "" };
  private _now = Date.now();
  private _error = "";
  /** entity_id → flash-expiry epoch ms for recently finished timers. */
  private _flashes: Record<string, number> = {};
  private _durEditId = "";
  private _durMin = 0;
  private _durSec = 0;
  private _menuOpenId = "";
  private _createOpen = false;
  private _createName = "";
  private _createMin = 5;
  private _createSec = 0;
  private _busy = false;

  private _configEntities: string[] = [];
  private _tick?: number;
  private _unsubFinished?: Promise<() => Promise<void>>;

  static getConfigElement() {
    return document.createElement("btoddb-timer-card-editor");
  }

  static getStubConfig() {
    return {};
  }

  setConfig(config: CardConfig): void {
    this._config = config ?? { type: "" };
    const { valid, rejected } = partitionTimerEntities(config?.entities);
    if (rejected.length) {
      console.warn(
        `btoddb-timer-card: ignoring non-timer entities: ${rejected.join(", ")}`,
      );
    }
    this._configEntities = valid;
  }

  getCardSize(): number {
    return 1 + Math.min(this._rows().length, 8);
  }

  disconnectedCallback(): void {
    super.disconnectedCallback();
    this._stopTick();
    this._unsubFinished?.then((unsub) => unsub()).catch(() => undefined);
    this._unsubFinished = undefined;
  }

  protected updated(): void {
    if (!this.hass) return;
    if (!this._unsubFinished && this.hass.connection) {
      this._unsubFinished = this.hass.connection.subscribeEvents<TimerFinishedEvent>(
        (ev) => this._onTimerFinished(ev),
        "timer.finished",
      );
      this._unsubFinished.catch(() => {
        this._unsubFinished = undefined;
      });
    }
    this._syncTick();
  }

  /** Run the 1-second tick only while an active timer is rendered (TC-4). */
  private _syncTick(): void {
    const needed = this._rows().some((r) => r.state === "active");
    if (needed && this._tick === undefined) {
      this._tick = window.setInterval(() => {
        this._now = Date.now();
      }, 1_000);
    } else if (!needed) {
      this._stopTick();
    }
  }

  private _stopTick(): void {
    if (this._tick !== undefined) {
      window.clearInterval(this._tick);
      this._tick = undefined;
    }
  }

  private _onTimerFinished(ev: TimerFinishedEvent): void {
    const entityId = ev.data?.entity_id ?? "";
    if (!this._entityIds().includes(entityId)) return;
    this._flashes = { ...this._flashes, [entityId]: Date.now() + FLASH_MS };
    window.setTimeout(() => this._expireFlashes(), FLASH_MS + 100);
  }

  private _expireFlashes(): void {
    const now = Date.now();
    const kept = Object.entries(this._flashes).filter(([, exp]) => exp > now);
    if (kept.length !== Object.keys(this._flashes).length) {
      this._flashes = Object.fromEntries(kept);
    }
  }

  private _dismissFlash(entityId: string): void {
    if (!(entityId in this._flashes)) return;
    const { [entityId]: _gone, ...rest } = this._flashes;
    this._flashes = rest;
  }

  /** The entity_ids to render: configured list, or every `timer.*` (TC-2). */
  private _entityIds(): string[] {
    if (this._configEntities.length) return this._configEntities;
    return Object.keys(this.hass?.states ?? {}).filter((id) =>
      id.startsWith("timer."),
    );
  }

  private _rows(): TimerRowData[] {
    const rows: TimerRowData[] = [];
    for (const entityId of this._entityIds()) {
      const st = this.hass?.states[entityId];
      if (!st) continue;
      const finishesAt = st.attributes.finishes_at as string | undefined;
      const finishesAtMs = finishesAt ? Date.parse(finishesAt) : NaN;
      rows.push({
        entityId,
        name: (st.attributes.friendly_name as string) ?? entityId,
        state: st.state,
        durationSec: parseDuration(st.attributes.duration),
        remainingSec: parseDuration(st.attributes.remaining),
        finishesAtMs: Number.isFinite(finishesAtMs) ? finishesAtMs : null,
      });
    }
    // A configured list keeps its order; auto-discovery sorts (TC-8).
    return this._configEntities.length ? rows : sortTimerRows(rows);
  }

  private _isAdmin(): boolean {
    return this.hass?.user?.is_admin === true;
  }

  private _msg(err: unknown): string {
    if (err && typeof err === "object" && "message" in err) {
      return String((err as { message: unknown }).message);
    }
    return String(err);
  }

  private async _service(
    service: "start" | "pause" | "cancel",
    entityId: string,
    duration?: string,
  ): Promise<void> {
    const data: Record<string, unknown> = { entity_id: entityId };
    if (duration) data.duration = duration;
    this._error = "";
    try {
      await this.hass.callService("timer", service, data);
    } catch (err) {
      this._error = `Could not ${service} timer: ${this._msg(err)}`;
    }
  }

  private _openDurEdit(row: TimerRowData): void {
    this._durEditId = row.entityId;
    this._durMin = Math.floor(row.durationSec / 60);
    this._durSec = row.durationSec % 60;
    this._menuOpenId = "";
  }

  private _closeDurEdit(): void {
    this._durEditId = "";
  }

  private _durEditSeconds(): number {
    return this._durMin * 60 + this._durSec;
  }

  private async _startEdited(entityId: string): Promise<void> {
    const seconds = this._durEditSeconds();
    if (seconds <= 0) {
      this._error = "Duration must be more than zero.";
      return;
    }
    this._closeDurEdit();
    // The override goes only to timer.start — the helper's stored default
    // duration is not modified (TC-6).
    await this._service("start", entityId, toServiceDuration(seconds));
  }

  private async _create(): Promise<void> {
    const name = this._createName.trim();
    if (!name) {
      this._error = "Enter a timer name.";
      return;
    }
    const seconds = this._createMin * 60 + this._createSec;
    if (seconds <= 0) {
      this._error = "Duration must be more than zero.";
      return;
    }
    this._busy = true;
    this._error = "";
    try {
      await this.hass.callWS({
        type: "timer/create",
        name,
        duration: toServiceDuration(seconds),
        restore: true,
      });
      this._createOpen = false;
      this._createName = "";
      this._createMin = 5;
      this._createSec = 0;
    } catch (err) {
      this._error = `Could not create timer: ${this._msg(err)}`;
    } finally {
      this._busy = false;
    }
  }

  private async _delete(row: TimerRowData): Promise<void> {
    this._menuOpenId = "";
    if (!window.confirm(`Delete timer "${row.name}"?`)) return;
    this._error = "";
    try {
      // timer/delete wants the storage-collection item id, which is the
      // entity's unique_id — resolve it via the entity registry.
      const entry = await this.hass.callWS<EntityRegistryEntry>({
        type: "config/entity_registry/get",
        entity_id: row.entityId,
      });
      await this.hass.callWS({
        type: "timer/delete",
        timer_id: entry.unique_id,
      });
    } catch (err) {
      this._error = `Could not delete timer (YAML-defined timers can only be removed in YAML): ${this._msg(err)}`;
    }
  }

  private _renderDurEdit(row: TimerRowData) {
    const numInput = (
      value: number,
      max: number,
      onInput: (n: number) => void,
    ) => html`
      <input
        class="dur-input"
        type="number"
        min="0"
        max=${max}
        .value=${String(value)}
        @input=${(e: Event) => {
          const n = parseInt((e.target as HTMLInputElement).value, 10);
          onInput(Number.isFinite(n) && n >= 0 ? n : 0);
        }}
      />
    `;
    return html`
      <div class="dur-edit">
        ${numInput(this._durMin, 999, (n) => (this._durMin = n))}
        <span class="dur-label">min</span>
        ${numInput(this._durSec, 59, (n) => (this._durSec = Math.min(n, 59)))}
        <span class="dur-label">sec</span>
        ${[1, 5, 10].map(
          (m) => html`
            <button
              type="button"
              class="chip"
              @click=${() => (this._durMin = this._durMin + m)}
            >
              +${m}m
            </button>
          `,
        )}
        <button
          type="button"
          class="btn btn-primary"
          @click=${() => this._startEdited(row.entityId)}
        >
          Start
        </button>
        <button
          type="button"
          class="btn btn-secondary"
          @click=${() => this._closeDurEdit()}
        >
          Cancel
        </button>
      </div>
    `;
  }

  private _renderRow(row: TimerRowData) {
    if (row.entityId in this._flashes) {
      return html`
        <div
          class="item finished"
          role="button"
          tabindex="0"
          title="Tap to dismiss"
          @click=${() => this._dismissFlash(row.entityId)}
          @keydown=${(e: KeyboardEvent) => {
            if (e.key === "Enter" || e.key === " ") this._dismissFlash(row.entityId);
          }}
        >
          <ha-icon class="leading" icon="mdi:check-circle"></ha-icon>
          <div class="text">
            <span class="summary">${row.name} — Done!</span>
          </div>
        </div>
      `;
    }

    const isActive = row.state === "active";
    const isPaused = row.state === "paused";
    const remaining = isActive
      ? row.finishesAtMs !== null
        ? secondsRemaining(row.finishesAtMs, this._now)
        : row.remainingSec
      : row.remainingSec;
    const icon = isActive
      ? "mdi:timer-outline"
      : isPaused
        ? "mdi:timer-pause-outline"
        : "mdi:timer-off-outline";
    const editing = this._durEditId === row.entityId;

    return html`
      <div class="item ${row.state}">
        <ha-icon class="leading" icon=${icon}></ha-icon>
        <div class="text">
          <span class="summary">${row.name}</span>
          ${isActive
            ? html`<div class="progress">
                <div
                  class="progress-fill"
                  style="width:${(
                    progressFraction(row.durationSec, remaining) * 100
                  ).toFixed(1)}%"
                ></div>
              </div>`
            : nothing}
        </div>
        ${isActive || isPaused
          ? html`<span class="countdown ${isPaused ? "paused" : ""}"
              >${formatCountdown(remaining)}</span
            >`
          : html`<button
              type="button"
              class="duration-btn"
              title="Set a different duration"
              @click=${() => this._openDurEdit(row)}
            >
              ${formatCountdown(row.durationSec)}
            </button>`}
        ${isActive
          ? html`
              <ha-icon-button
                .label=${"Pause timer"}
                @click=${() => this._service("pause", row.entityId)}
              >
                <ha-icon icon="mdi:pause"></ha-icon>
              </ha-icon-button>
            `
          : html`
              <ha-icon-button
                .label=${isPaused ? "Resume timer" : "Start timer"}
                @click=${() => this._service("start", row.entityId)}
              >
                <ha-icon icon="mdi:play"></ha-icon>
              </ha-icon-button>
            `}
        ${isActive || isPaused
          ? html`
              <ha-icon-button
                .label=${"Cancel timer"}
                @click=${() => this._service("cancel", row.entityId)}
              >
                <ha-icon icon="mdi:close"></ha-icon>
              </ha-icon-button>
            `
          : this._isAdmin()
            ? html`
                <div class="menu-wrap">
                  <ha-icon-button
                    .label=${"More options"}
                    @click=${() => {
                      this._menuOpenId =
                        this._menuOpenId === row.entityId ? "" : row.entityId;
                    }}
                  >
                    <ha-icon icon="mdi:dots-vertical"></ha-icon>
                  </ha-icon-button>
                  ${this._menuOpenId === row.entityId
                    ? html`
                        <div class="menu">
                          <button
                            type="button"
                            class="menu-item"
                            @click=${() => this._delete(row)}
                          >
                            <ha-icon icon="mdi:delete-outline"></ha-icon>
                            Delete
                          </button>
                        </div>
                      `
                    : nothing}
                </div>
              `
            : nothing}
      </div>
      ${editing ? this._renderDurEdit(row) : nothing}
    `;
  }

  private _renderCreatePanel() {
    return html`
      <div class="create-panel">
        <input
          class="create-name"
          type="text"
          placeholder="Timer name"
          .value=${this._createName}
          @input=${(e: Event) => {
            this._createName = (e.target as HTMLInputElement).value;
          }}
          @keydown=${(e: KeyboardEvent) => {
            if (e.key === "Enter") this._create();
          }}
        />
        <input
          class="dur-input"
          type="number"
          min="0"
          max="999"
          .value=${String(this._createMin)}
          @input=${(e: Event) => {
            const n = parseInt((e.target as HTMLInputElement).value, 10);
            this._createMin = Number.isFinite(n) && n >= 0 ? n : 0;
          }}
        />
        <span class="dur-label">min</span>
        <input
          class="dur-input"
          type="number"
          min="0"
          max="59"
          .value=${String(this._createSec)}
          @input=${(e: Event) => {
            const n = parseInt((e.target as HTMLInputElement).value, 10);
            this._createSec = Number.isFinite(n) && n >= 0 ? Math.min(n, 59) : 0;
          }}
        />
        <span class="dur-label">sec</span>
        <button
          type="button"
          class="btn btn-primary"
          ?disabled=${this._busy}
          @click=${() => this._create()}
        >
          Create
        </button>
        <button
          type="button"
          class="btn btn-secondary"
          ?disabled=${this._busy}
          @click=${() => {
            this._createOpen = false;
          }}
        >
          Cancel
        </button>
      </div>
    `;
  }

  render() {
    if (!this.hass) return nothing;
    this._expireFlashes();
    const title = this._config.title ?? "Timers";
    const rows = this._rows();
    return html`
      <ha-card>
        <div class="header">
          <span class="header-title">${title}</span>
          ${this._isAdmin()
            ? html`
                <ha-icon-button
                  .label=${"New timer"}
                  @click=${() => {
                    this._createOpen = !this._createOpen;
                  }}
                >
                  <ha-icon icon="mdi:plus"></ha-icon>
                </ha-icon-button>
              `
            : nothing}
        </div>
        <div class="content">
          ${this._createOpen ? this._renderCreatePanel() : nothing}
          ${this._error ? html`<div class="error">${this._error}</div>` : nothing}
          ${rows.length
            ? html`<div class="list">${rows.map((r) => this._renderRow(r))}</div>`
            : html`<div class="empty">
                No timers.${this._isAdmin() ? " Use ＋ to create one." : ""}
              </div>`}
        </div>
      </ha-card>
    `;
  }

  static styles = css`
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
  `;
}

if (!customElements.get("btoddb-timer-card")) {
  customElements.define("btoddb-timer-card", BtoddbTimerCard);
}

declare global {
  interface HTMLElementTagNameMap {
    "btoddb-timer-card": BtoddbTimerCard;
    "btoddb-timer-card-editor": BtoddbTimerCardEditor;
  }
}
