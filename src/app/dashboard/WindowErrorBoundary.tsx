"use client";

import { Component, Fragment, type ReactNode } from "react";
import { PixelIcon } from "@/components/PixelIcon";

type Props = { children: ReactNode; label: string; reloadLabel: string };
type State = { crashed: boolean; nonce: number };

/**
 * Isolates a single dashboard window: a render error in one panel shows an
 * in-place pixel fallback with a Reload button (bumps a nonce to remount just
 * that subtree) instead of unmounting the whole OS. Additive — the happy path
 * is untouched. Labels are passed in already-translated (the boundary is a
 * class component, so it cannot call the useT hook itself).
 */
export default class WindowErrorBoundary extends Component<Props, State> {
  state: State = { crashed: false, nonce: 0 };

  static getDerivedStateFromError(): Partial<State> {
    return { crashed: true };
  }

  componentDidCatch(error: unknown) {
    console.error("[window crashed]", error);
  }

  reload = () => this.setState((s) => ({ crashed: false, nonce: s.nonce + 1 }));

  render() {
    if (this.state.crashed) {
      return (
        <div className="win-flat h-full grid place-items-center p-6 text-center">
          <div className="space-y-3">
            <PixelIcon name="alert" size={28} className="text-[var(--destructive)] mx-auto" />
            <p className="text-base text-[var(--text-muted)]">{this.props.label}</p>
            <button onClick={this.reload} className="pbtn pbtn-sm pbtn-primary">
              <PixelIcon name="reload" size={12} /> {this.props.reloadLabel}
            </button>
          </div>
        </div>
      );
    }
    return <Fragment key={this.state.nonce}>{this.props.children}</Fragment>;
  }
}
