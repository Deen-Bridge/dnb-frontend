"use client";
export type ReceiptStatus = "pending" | "confirmed" | "failed" | "unknown";
export function VerifiedReceipt({
  status,
  amount,
  asset = "USDC",
  issuer,
  network,
  hash,
  ledgerTime,
}: {
  status: ReceiptStatus;
  amount?: string;
  asset?: string;
  issuer?: string;
  network?: string;
  hash?: string;
  ledgerTime?: string;
}) {
  const verified = status === "confirmed" && !!hash && !!network;
  const explorer =
    verified && network === "testnet"
      ? `https://stellar.expert/explorer/testnet/tx/${hash}`
      : undefined;
  return (
    <section aria-label="Payment receipt">
      <strong>
        {verified
          ? "Payment confirmed"
          : status === "pending"
            ? "Payment pending"
            : status === "failed"
              ? "Payment failed"
              : "Payment status unknown"}
      </strong>
      {amount && (
        <p>
          {amount} {asset}
        </p>
      )}
      {issuer && <p>Issuer: {issuer}</p>}
      {network && <p>Network: {network}</p>}
      {ledgerTime && <p>Ledger time: {ledgerTime}</p>}
      {explorer && (
        <a href={explorer} rel="noreferrer" target="_blank">
          View verified transaction
        </a>
      )}
    </section>
  );
}
