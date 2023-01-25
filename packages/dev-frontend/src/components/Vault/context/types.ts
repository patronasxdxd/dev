type NoneView = "NONE";
type LiquidatedView = "LIQUIDATED";
type RedeemedView = "REDEEMED";
type OpeningView = "OPENING";
type AdjustingView = "ADJUSTING";
type ClosingView = "CLOSING";
type ActiveView = "ACTIVE";

export type VaultView =
  | NoneView
  | LiquidatedView
  | RedeemedView
  | OpeningView
  | AdjustingView
  | ClosingView
  | ActiveView;

type OpenVaultPressedEvent = "OPEN_VAULT_PRESSED";
type AdjustVaultPressedEvent = "ADJUST_VAULT_PRESSED";
type CloseVaultPressedEvent = "CLOSE_VAULT_PRESSED";
type CancelAdjustVaultPressed = "CANCEL_ADJUST_VAULT_PRESSED";
type VaultAdjustedEvent = "VAULT_ADJUSTED";
type VaultOpenedEvent = "VAULT_OPENED";
type VaultClosedEvent = "VAULT_CLOSED";
type VaultLiquidatedEvent = "VAULT_LIQUIDATED";
type VaultRedeemedEvent = "VAULT_REDEEMED";
type VaultSurplusCollateralClaimedEvent = "VAULT_SURPLUS_COLLATERAL_CLAIMED";

export type VaultEvent =
  | OpenVaultPressedEvent
  | AdjustVaultPressedEvent
  | CloseVaultPressedEvent
  | CancelAdjustVaultPressed
  | VaultClosedEvent
  | VaultLiquidatedEvent
  | VaultRedeemedEvent
  | VaultAdjustedEvent
  | VaultSurplusCollateralClaimedEvent
  | VaultOpenedEvent;
