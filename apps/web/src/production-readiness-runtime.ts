let productionReadinessRuntimeInstalled = false;

export function installProductionReadinessRuntime(): void {
  if (productionReadinessRuntimeInstalled || typeof document === 'undefined') return;
  productionReadinessRuntimeInstalled = true;

  document.documentElement.dataset.sovereignProductionReadiness = 'desktop-ios-v1';
}
