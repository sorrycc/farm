import { HmrUpdateResult } from './types';
import type { ModuleSystem } from '@farmfe/runtime/src/module-system';

const REGISTERED_HOT_MODULES = new Map<string, HotModuleState>();

export class HotModuleState {
  acceptCallbacks: Array<() => void> = [];

  id: string;

  constructor(id: string) {
    this.id = id;
  }

  accept(callback?: () => void) {
    if (callback) {
      this.acceptCallbacks.push(callback);
    }
  }
}

export function createHotContext(id: string) {
  const state = new HotModuleState(id);
  REGISTERED_HOT_MODULES.set(id, state);
  return state;
}

export function applyHotUpdates(
  result: HmrUpdateResult,
  moduleSystem: ModuleSystem
) {
  console.log(result);

  for (const id of result.removed) {
    moduleSystem.delete(id);
  }

  for (const id of result.added) {
    moduleSystem.register(id, result.modules[id]);
  }

  for (const id of result.changed) {
    moduleSystem.update(id, result.modules[id]);
  }
  // TODO support accept dependencies change
  for (const boundary of Object.keys(result.boundaries)) {
    const chains = result.boundaries[boundary];

    for (const id of chains) {
      moduleSystem.clearCache(id);
    }

    // re-execute the boundary module
    moduleSystem.require(boundary);
  }
}