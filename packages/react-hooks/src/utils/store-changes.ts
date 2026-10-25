type StoreChangeFunction = () => void;

let deferDepth = 0;

let flushScheduled = false;

let pendingStoreChanges: StoreChangeFunction[] = [];

export const flushStoreChanges = () => {
  flushScheduled = false;

  const storeChanges = pendingStoreChanges;

  pendingStoreChanges = [];

  for (const storeChange of storeChanges) {
    storeChange();
  }
};

const scheduleStoreChange = (storeChange: StoreChangeFunction) => {
  if (!pendingStoreChanges.includes(storeChange)) {
    pendingStoreChanges.push(storeChange);
  }

  if (flushScheduled) {
    return;
  }

  flushScheduled = true;

  queueMicrotask(flushStoreChanges);
};

export const notifyStoreChange = (storeChange: StoreChangeFunction) => {
  if (deferDepth > 0) {
    scheduleStoreChange(storeChange);

    return;
  }

  storeChange();
};

export const deferStoreChanges = (update: () => void) => {
  deferDepth += 1;

  try {
    update();
  } finally {
    deferDepth -= 1;
  }
};
